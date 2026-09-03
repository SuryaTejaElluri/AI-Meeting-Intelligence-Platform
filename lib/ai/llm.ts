import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildAnalysisPrompt, buildQaPrompt, buildFollowUpEmailPrompt } from './prompts';
import { MeetingSummaryData, ActionItemData, DecisionData, TopicData } from '../types';

export interface MeetingAnalysisResult {
  summary: MeetingSummaryData;
  actionItems: ActionItemData[];
  decisions: DecisionData[];
  topics: TopicData[];
}

/**
 * Run LLM inference using Gemini Pro API (primary) or local Open-Source LLM (fallback).
 * No hardcoded responses—returns empty string if both fail.
 */
export async function runLLMInference(prompt: string): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const candidateModels = Array.from(new Set([primaryModel, 'gemini-1.5-flash', 'gemini-1.5-pro']));

  // Primary & Fallbacks: Google Gemini API
  if (geminiApiKey) {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    for (const modelName of candidateModels) {
      try {
        console.log(`[AI LLM Engine] Calling Gemini '${modelName}'...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text) {
          console.log(`[AI LLM Engine] ✅ Response received from '${modelName}'`);
          return text;
        }
      } catch (err: any) {
        console.warn(`[AI LLM Engine] Gemini model '${modelName}' error: ${err?.message || err}`);
      }
    }
  }

  // Fallback: Local Open-Source LLM (Ollama / Groq API)
  const llmUrl = process.env.OPEN_SOURCE_LLM_URL || 'http://localhost:11434/api/generate';
  const openSourceModel = process.env.OPEN_SOURCE_LLM_MODEL || 'llama3';

  try {
    const response = await fetch(llmUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: openSourceModel,
        prompt: prompt,
        stream: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || data.text || '';
    }
  } catch (err: any) {
    console.error('[AI LLM Engine] Local LLM endpoint unreachable:', err?.message || err);
  }

  return '';
}

/**
 * Refines raw Whisper transcript segments by identifying actual speaker names
 * from self-introductions (e.g. "My name is Patricia Collins") or assigning
 * contextual roles (e.g. "Sales Representative", "Customer Service Rep").
 */
export async function refineSpeakerDiarizationWithLLM(
  rawSegments: any[]
): Promise<{ segments: any[]; content: string }> {
  if (!rawSegments || rawSegments.length === 0) {
    return { segments: [], content: '' };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  if (!geminiApiKey) {
    const content = rawSegments.map((s: any) => `[${s.speaker || 'Speaker 1'}]: ${s.text}`).join('\n');
    return { segments: rawSegments, content };
  }

  const prompt = `You are an expert audio transcript diarization and speaker identification engine.
Analyze these raw timestamped speech-to-text segments:

${JSON.stringify(rawSegments, null, 2)}

Rules for Speaker Identification:
1. Detect self-introductions or names stated in the dialogue (e.g., "My name is Patricia Collins" -> speaker name is "Patricia Collins", "This is Christopher Green" -> "Christopher Green").
2. If a speaker does not state a personal name, assign a descriptive role based on context (e.g., "Sales Representative", "Customer Service Rep", "Meeting Participant").
3. Group contiguous speech by the same speaker under the SAME name/role.
4. Keep the exact "start", "end", and "text" fields unchanged. ONLY update the "speaker" field.

Output strictly valid JSON with no markdown formatting:
{
  "segments": [
    {
      "start": 0,
      "end": 3.2,
      "speaker": "Real Name or Role",
      "text": "Exact speech text"
    }
  ]
}`;

  try {
    console.log('[LLM Diarization] Identifying real speaker names & roles from transcript...');
    const rawResponse = await runLLMInference(prompt);

    let cleanText = rawResponse.trim();
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.segments && Array.isArray(parsed.segments) && parsed.segments.length > 0) {
        const refinedSegments = parsed.segments.map((seg: any) => ({
          start: seg.start,
          end: seg.end,
          speaker: seg.speaker || 'Participant',
          text: seg.text,
        }));
        const content = refinedSegments.map((s: any) => `[${s.speaker}]: ${s.text}`).join('\n');
        console.log(`[LLM Diarization] ✅ Identified ${new Set(refinedSegments.map((s: any) => s.speaker)).size} unique speakers/participants.`);
        return { segments: refinedSegments, content };
      }
    }
  } catch (err: any) {
    console.warn('[LLM Diarization] Speaker resolution warning:', err?.message || err);
  }

  const fallbackContent = rawSegments.map((s: any) => `[${s.speaker || 'Speaker 1'}]: ${s.text}`).join('\n');
  return { segments: rawSegments, content: fallbackContent };
}

/**
 * Analyze a meeting transcript and extract structured insights.
 * Throws an error if no LLM is available.
 */
export async function analyzeTranscriptWithLLM(transcriptText: string): Promise<MeetingAnalysisResult> {
  const prompt = buildAnalysisPrompt(transcriptText);
  const rawResponse = await runLLMInference(prompt);

  if (!rawResponse) {
    throw new Error(
      'AI analysis failed: No LLM response received. ' +
      'Please ensure your GEMINI_API_KEY is configured correctly in .env.'
    );
  }

  try {
    // Strip markdown code fences if present
    let cleanText = rawResponse.trim();
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.summary && Array.isArray(parsed.actionItems) && Array.isArray(parsed.decisions)) {
        return {
          summary: {
            overview: parsed.summary.overview || 'Overview not available.',
            keyDiscussionPts: parsed.summary.keyDiscussionPts || [],
            participants: parsed.summary.participants || [],
          },
          actionItems: (parsed.actionItems || []).map((item: any) => ({
            description: item.description,
            responsiblePerson: item.responsiblePerson || 'Unassigned',
            deadline: item.deadline || 'Not specified',
            status: 'PENDING',
          })),
          decisions: (parsed.decisions || []).map((d: any) => ({
            description: d.description,
            category: d.category || 'General',
          })),
          topics: (parsed.topics || []).map((t: any) => ({
            name: t.name,
            summary: t.summary || '',
            timestamp: t.timestamp || '',
          })),
        };
      }
    }
  } catch (e) {
    console.error('[AI LLM Engine] Failed to parse analysis JSON:', e);
  }

  throw new Error(
    'AI analysis failed: Could not parse the structured response from the LLM. ' +
    'Raw response received but JSON extraction failed.'
  );
}

/**
 * Answer a natural language question about a meeting using the transcript context.
 */
export async function askMeetingQuestion(transcriptText: string, question: string): Promise<string> {
  const prompt = buildQaPrompt(transcriptText, question);
  const response = await runLLMInference(prompt);

  if (response && response.trim().length > 5) {
    return response.trim();
  }

  return 'Sorry, I was unable to generate an answer at this time. Please check that your Gemini API key is configured correctly and try again.';
}

/**
 * Generate a professional follow-up email based on meeting insights.
 */
export async function generateFollowUpEmail(
  title: string,
  summary: string,
  decisions: string[],
  actionItems: { description: string; responsiblePerson?: string; deadline?: string }[]
): Promise<{ subject: string; body: string }> {
  const prompt = buildFollowUpEmailPrompt(title, summary, decisions, actionItems);
  const response = await runLLMInference(prompt);

  if (response) {
    try {
      let cleanText = response.trim();
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.subject && parsed.body) {
          return { subject: parsed.subject, body: parsed.body };
        }
      }
    } catch {}

    // If not valid JSON, use the raw text as the email body
    return {
      subject: `Follow-Up: ${title} - Key Decisions & Action Items`,
      body: response.trim(),
    };
  }

  return {
    subject: `Follow-Up: ${title}`,
    body: 'Unable to generate email content. Please ensure your AI API key is configured correctly.',
  };
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptSegment } from '../types';
import { readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

/**
 * Transcription Pipeline:
 *   1. PRIMARY: openai/whisper-small via local Python server (FREE, offline)
 *   2. FALLBACK: Gemini 3.6 Flash multimodal audio API
 * 
 * Whisper Small server runs at http://localhost:8100/transcribe
 */

const WHISPER_SERVER_URL = process.env.WHISPER_SERVER_URL || 'http://localhost:8100';

export async function transcribeAudioWithWhisperSmall(
  fileUrl: string,
  fileType: string
): Promise<{ content: string; segments: TranscriptSegment[]; duration: number }> {

  // Resolve the absolute file path from the public directory
  const absolutePath = path.join(process.cwd(), 'public', fileUrl);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Audio file not found at: ${absolutePath}. Please re-upload the file.`);
  }

  // ──── PRIMARY: openai/whisper-small via Python server (FREE) ────
  try {
    console.log(`[Whisper Small] Sending audio to local Whisper server at ${WHISPER_SERVER_URL}...`);

    // Check if Whisper server is running
    const healthCheck = await fetch(`${WHISPER_SERVER_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (healthCheck.ok) {
      // Read the audio file and send as multipart form data
      const audioBuffer = await readFile(absolutePath);
      const blob = new Blob([audioBuffer], { type: fileType || 'audio/wav' });
      
      const formData = new FormData();
      formData.append('file', blob, path.basename(absolutePath));

      const response = await fetch(`${WHISPER_SERVER_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
          const segments: TranscriptSegment[] = data.segments.map((seg: any) => ({
            start: seg.start,
            end: seg.end,
            speaker: seg.speaker || 'Speaker 1',
            text: seg.text,
          }));

          console.log(`[Whisper Small] ✅ Transcribed ${segments.length} segments (${data.duration}s) using openai/whisper-small in ${data.processingTime}s`);

          return {
            content: data.content || segments.map(s => `[${s.speaker}]: ${s.text}`).join('\n'),
            segments,
            duration: data.duration || segments[segments.length - 1].end,
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`[Whisper Small] Server returned ${response.status}: ${errText}`);
      }
    }
  } catch (err: any) {
    console.warn(`[Whisper Small] Local server not available: ${err.message}`);
    console.warn('[Whisper Small] Falling back to Gemini for transcription...');
  }

  // ──── FALLBACK: Gemini Multimodal Audio Transcription ────
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  if (geminiApiKey) {
    try {
      console.log(`[Transcription Fallback] Using Gemini '${modelName}' for audio transcription...`);

      const audioBuffer = await readFile(absolutePath);
      const audioBase64 = audioBuffer.toString('base64');
      const mimeType = getMimeType(absolutePath, fileType);

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const transcriptionPrompt = `You are a professional meeting transcription engine.
Transcribe the provided audio recording precisely and completely. Do NOT summarize. Do NOT skip any content.

Output ONLY a valid JSON object with no markdown formatting, no explanation, no \`\`\`json blocks. Just the raw JSON:
{
  "segments": [
    {
      "start": 0,
      "end": 15,
      "speaker": "Speaker Name or Speaker 1",
      "text": "Exact words spoken in this segment"
    }
  ]
}

Rules:
- Transcribe ALL speech content from start to end. Every word matters.
- Identify different speakers where possible (use names if mentioned, otherwise Speaker 1, Speaker 2, etc.)
- Create segments of 10-30 seconds each with accurate start/end timestamps in seconds
- Ensure timestamps are sequential and non-overlapping
- Do NOT add any commentary, summary, or analysis. Only transcribe what was said.`;

      const result = await model.generateContent([
        { inlineData: { mimeType, data: audioBase64 } },
        { text: transcriptionPrompt },
      ]);

      const response = await result.response;
      const rawText = response.text();

      if (rawText) {
        const parsed = parseTranscriptionResponse(rawText);
        if (parsed && parsed.segments.length > 0) {
          console.log(`[Transcription Fallback] ✅ Gemini transcribed ${parsed.segments.length} segments.`);
          return parsed;
        }
      }
    } catch (err: any) {
      console.error('[Transcription Fallback] Gemini audio transcription error:', err?.message || err);
    }
  }

  // ──── NO FALLBACK — throw error ────
  throw new Error(
    'Transcription failed: Neither the Whisper Small server (http://localhost:8100) nor the Gemini API could process the audio. ' +
    'Start the Whisper server with: cd whisper-server && python server.py'
  );
}

/**
 * Parse the raw JSON text from Gemini transcription response.
 */
function parseTranscriptionResponse(rawText: string): { content: string; segments: TranscriptSegment[]; duration: number } | null {
  try {
    let cleanText = rawText.trim();
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.segments || !Array.isArray(parsed.segments) || parsed.segments.length === 0) return null;

    const segments: TranscriptSegment[] = parsed.segments.map((seg: any, idx: number) => ({
      start: typeof seg.start === 'number' ? seg.start : idx * 15,
      end: typeof seg.end === 'number' ? seg.end : (idx + 1) * 15,
      speaker: seg.speaker || `Speaker ${(idx % 3) + 1}`,
      text: (seg.text || '').trim(),
    }));

    const content = segments.map(s => `[${s.speaker}]: ${s.text}`).join('\n');
    const duration = segments.length > 0 ? segments[segments.length - 1].end : 60;

    return { content, segments, duration };
  } catch {
    return null;
  }
}

/**
 * Map file extension to MIME type.
 */
function getMimeType(filePath: string, fileType: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.mp3': 'audio/mp3',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4',
    '.webm': 'audio/webm',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
  };
  return mimeMap[ext] || fileType || 'audio/mp3';
}

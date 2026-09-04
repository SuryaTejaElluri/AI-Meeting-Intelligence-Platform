import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptSegment } from '../types';
import { readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

/**
 * Speech-to-Text Pipeline:
 *   1. PRIMARY: Groq Hosted Whisper API (whisper-large-v3-turbo) — FREE, 0.5s execution, no server needed
 *   2. SECONDARY: Local Python Whisper Small Server (http://localhost:8100) — FREE, offline
 *   3. TERTIARY: Gemini 3.6 Flash multimodal audio API
 */

const WHISPER_SERVER_URL = process.env.WHISPER_SERVER_URL || 'http://localhost:8100';

export async function transcribeAudioWithWhisperSmall(
  fileUrl: string,
  fileType: string
): Promise<{ content: string; segments: TranscriptSegment[]; duration: number }> {

  // Resolve the absolute file path (supports public/uploads locally & /tmp/uploads on Vercel)
  const filename = path.basename(fileUrl);
  let absolutePath = path.join(process.cwd(), 'public', 'uploads', filename);

  if (!fs.existsSync(absolutePath)) {
    const tmpPath = path.join(path.sep, 'tmp', 'uploads', filename);
    if (fs.existsSync(tmpPath)) {
      absolutePath = tmpPath;
    }
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Audio file not found at ${absolutePath}. Please re-upload the recording file.`);
  }

  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  const groqModel = process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo';

  // ──── 1. PRIMARY: Groq Free Hosted Whisper API ────
  if (groqApiKey) {
    try {
      console.log(`[Groq Whisper STT] Transcribing audio with '${groqModel}' via Groq LPU Cloud...`);
      const audioBuffer = await readFile(absolutePath);
      const filename = path.basename(absolutePath);
      const mimeType = getMimeType(absolutePath, fileType);

      const blob = new Blob([audioBuffer], { type: mimeType });
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('model', groqModel);
      formData.append('response_format', 'verbose_json');
      formData.append('temperature', '0.0');

      const startTime = Date.now();
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
          const segments: TranscriptSegment[] = data.segments.map((seg: any) => ({
            start: Math.round((seg.start || 0) * 10) / 10,
            end: Math.round((seg.end || 0) * 10) / 10,
            speaker: seg.speaker || 'Speaker 1',
            text: (seg.text || '').trim(),
          }));

          const content = data.text || segments.map(s => `[${s.speaker}]: ${s.text}`).join('\n');
          const duration = Math.round(data.duration || segments[segments.length - 1].end || 60);

          console.log(`[Groq Whisper STT] ✅ Transcribed ${segments.length} segments (${duration}s audio) in ${elapsed}s!`);

          return { content, segments, duration };
        } else if (data.text) {
          const content = data.text;
          const segments: TranscriptSegment[] = [{
            start: 0,
            end: Math.round(data.duration || 60),
            speaker: 'Speaker 1',
            text: data.text.trim(),
          }];
          return { content, segments, duration: Math.round(data.duration || 60) };
        }
      } else {
        const errText = await response.text();
        console.warn(`[Groq Whisper STT] Groq returned ${response.status}: ${errText}`);
      }
    } catch (err: any) {
      console.warn(`[Groq Whisper STT] Groq transcription warning: ${err?.message || err}`);
    }
  }

  // ──── 2. SECONDARY: Local Python Whisper Small Server ────
  try {
    console.log(`[Whisper Small Local] Checking local server at ${WHISPER_SERVER_URL}...`);
    const healthCheck = await fetch(`${WHISPER_SERVER_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (healthCheck.ok) {
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

          console.log(`[Whisper Small Local] ✅ Transcribed ${segments.length} segments using local whisper-small.`);
          return {
            content: data.content || segments.map(s => `[${s.speaker}]: ${s.text}`).join('\n'),
            segments,
            duration: data.duration || segments[segments.length - 1].end,
          };
        }
      }
    }
  } catch (err: any) {
    console.warn(`[Whisper Small Local] Local server unreachable: ${err.message}`);
  }

  // ──── 3. TERTIARY: Gemini Multimodal Audio Transcription ────
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

Output ONLY a valid JSON object with no markdown formatting:
{
  "segments": [
    {
      "start": 0,
      "end": 15,
      "speaker": "Speaker Name or Speaker 1",
      "text": "Exact words spoken in this segment"
    }
  ]
}`;

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

  // ──── NO FALLBACK AVAILABLE ────
  throw new Error(
    'Transcription failed: Could not process the audio recording. ' +
    'Please verify your GROQ_API_KEY or GEMINI_API_KEY in .env.'
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

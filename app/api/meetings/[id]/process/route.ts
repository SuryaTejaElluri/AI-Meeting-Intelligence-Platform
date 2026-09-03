import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { transcribeAudioWithWhisperSmall } from '@/lib/ai/whisper';
import { analyzeTranscriptWithLLM, refineSpeakerDiarizationWithLLM } from '@/lib/ai/llm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meeting = await prisma.meeting.findFirst({
      where: { id: params.id, userId: session.userId },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Update status to PROCESSING
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: 'PROCESSING', errorMessage: null },
    });

    // ──── Step 1: Transcribe audio using Whisper Small ────
    console.log(`[Process] Step 1: Transcribing speech with openai/whisper-small for meeting "${meeting.title}"...`);
    let rawContent: string;
    let rawSegments: any[];
    let duration: number;

    try {
      const transcription = await transcribeAudioWithWhisperSmall(meeting.fileUrl, meeting.fileType);
      rawContent = transcription.content;
      rawSegments = transcription.segments;
      duration = transcription.duration;
    } catch (transcribeErr: any) {
      console.error('[Process] Transcription failed:', transcribeErr.message);
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'FAILED', errorMessage: `Transcription Error: ${transcribeErr.message}` },
      });
      return NextResponse.json({ error: transcribeErr.message }, { status: 500 });
    }

    // ──── Step 1.5: Identify Real Speaker Names & Roles (Diarization Alignment) ────
    console.log(`[Process] Step 1.5: Identifying real speaker names & roles from speech context...`);
    const { segments, content } = await refineSpeakerDiarizationWithLLM(rawSegments);

    // Save transcript to database with real identified speaker names
    await prisma.transcript.upsert({
      where: { meetingId: meeting.id },
      create: {
        meetingId: meeting.id,
        content,
        segments: JSON.stringify(segments),
      },
      update: {
        content,
        segments: JSON.stringify(segments),
      },
    });

    console.log(`[Process] Transcript saved: ${segments.length} segments with real speaker names, ${duration}s duration.`);

    // ──── Step 2: Analyze transcript with LLM (Gemini Pro) ────
    console.log(`[Process] Step 2: Analyzing transcript with LLM for structured insights...`);
    let analytics;

    try {
      analytics = await analyzeTranscriptWithLLM(content);
    } catch (analysisErr: any) {
      console.error('[Process] LLM analysis failed:', analysisErr.message);
      // Still mark as COMPLETED since we have the transcript
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'COMPLETED', duration, errorMessage: `Analysis Warning: ${analysisErr.message}` },
      });
      return NextResponse.json({
        message: 'Transcript generated but AI analysis failed. You can view the transcript.',
        meeting: { id: meeting.id },
      });
    }

    // ──── Step 3: Save structured insights to database ────
    console.log(`[Process] Step 3: Saving structured insights to database...`);

    // Save Summary
    await prisma.summary.upsert({
      where: { meetingId: meeting.id },
      create: {
        meetingId: meeting.id,
        overview: analytics.summary.overview,
        keyDiscussionPts: JSON.stringify(analytics.summary.keyDiscussionPts),
        participants: JSON.stringify(analytics.summary.participants),
      },
      update: {
        overview: analytics.summary.overview,
        keyDiscussionPts: JSON.stringify(analytics.summary.keyDiscussionPts),
        participants: JSON.stringify(analytics.summary.participants),
      },
    });

    // Clear old insights before saving fresh ones
    await prisma.actionItem.deleteMany({ where: { meetingId: meeting.id } });
    await prisma.decision.deleteMany({ where: { meetingId: meeting.id } });
    await prisma.topic.deleteMany({ where: { meetingId: meeting.id } });

    // Save Action Items
    if (analytics.actionItems.length > 0) {
      await prisma.actionItem.createMany({
        data: analytics.actionItems.map((item) => ({
          meetingId: meeting.id,
          description: item.description,
          responsiblePerson: item.responsiblePerson,
          deadline: item.deadline,
          status: item.status || 'PENDING',
        })),
      });
    }

    // Save Decisions
    if (analytics.decisions.length > 0) {
      await prisma.decision.createMany({
        data: analytics.decisions.map((d) => ({
          meetingId: meeting.id,
          description: d.description,
          category: d.category,
        })),
      });
    }

    // Save Topics
    if (analytics.topics.length > 0) {
      await prisma.topic.createMany({
        data: analytics.topics.map((t) => ({
          meetingId: meeting.id,
          name: t.name,
          summary: t.summary,
          timestamp: t.timestamp,
        })),
      });
    }

    // ──── Step 4: Mark meeting as COMPLETED ────
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        status: 'COMPLETED',
        duration,
        errorMessage: null,
      },
    });

    console.log(`[Process] ✅ Meeting "${meeting.title}" processed successfully.`);
    console.log(`[Process]    Segments: ${segments.length}, Actions: ${analytics.actionItems.length}, Decisions: ${analytics.decisions.length}, Topics: ${analytics.topics.length}`);

    return NextResponse.json({
      message: 'Meeting processed successfully',
      meeting: updatedMeeting,
    });
  } catch (error: any) {
    console.error('[Process] Unexpected error:', error);
    try {
      await prisma.meeting.update({
        where: { id: params.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'An unexpected error occurred during processing',
        },
      });
    } catch {}
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
  }
}

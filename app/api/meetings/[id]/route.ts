import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meeting = await prisma.meeting.findFirst({
      where: { id: params.id, userId: session.userId },
      include: {
        transcripts: true,
        summary: true,
        actionItems: true,
        decisions: true,
        topics: true,
        chats: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const transcript = meeting.transcripts[0];
    const parsedTranscript = transcript
      ? {
          content: transcript.content,
          segments: JSON.parse(transcript.segments || '[]'),
        }
      : undefined;

    const parsedSummary = meeting.summary
      ? {
          overview: meeting.summary.overview,
          keyDiscussionPts: JSON.parse(meeting.summary.keyDiscussionPts || '[]'),
          participants: JSON.parse(meeting.summary.participants || '[]'),
        }
      : undefined;

    return NextResponse.json({
      meeting: {
        ...meeting,
        transcript: parsedTranscript,
        summary: parsedSummary,
      },
    });
  } catch (error) {
    console.error('Fetch Meeting Details Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

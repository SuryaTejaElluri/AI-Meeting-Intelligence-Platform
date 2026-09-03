import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { askMeetingQuestion } from '@/lib/ai/llm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question } = await req.json();
    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const meeting = await prisma.meeting.findFirst({
      where: { id: params.id, userId: session.userId },
      include: { transcripts: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const transcriptText = meeting.transcripts[0]?.content || '';
    const aiResponse = await askMeetingQuestion(transcriptText, question);

    const chat = await prisma.meetingChat.create({
      data: {
        meetingId: meeting.id,
        userQuestion: question,
        aiResponse,
      },
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

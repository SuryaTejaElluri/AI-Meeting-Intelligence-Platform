import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateFollowUpEmail } from '@/lib/ai/llm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meeting = await prisma.meeting.findFirst({
      where: { id: params.id, userId: session.userId },
      include: { summary: true, decisions: true, actionItems: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const summaryOverview = meeting.summary?.overview || 'Meeting overview not available.';
    const decisionList = meeting.decisions.map((d) => d.description);
    const actionList = meeting.actionItems.map((a) => ({
      description: a.description,
      responsiblePerson: a.responsiblePerson || undefined,
      deadline: a.deadline || undefined,
    }));

    const emailDraft = await generateFollowUpEmail(
      meeting.title,
      summaryOverview,
      decisionList,
      actionList
    );

    return NextResponse.json({ email: emailDraft });
  } catch (error) {
    console.error('Generate Email API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

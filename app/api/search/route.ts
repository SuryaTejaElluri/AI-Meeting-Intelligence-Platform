import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json({ meetings: [], transcripts: [], actionItems: [] });
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        userId: session.userId,
        OR: [
          { title: { contains: query } },
          { summary: { overview: { contains: query } } },
        ],
      },
      include: { summary: true, actionItems: true, decisions: true },
    });

    const transcripts = await prisma.transcript.findMany({
      where: {
        content: { contains: query },
        meeting: { userId: session.userId },
      },
      include: { meeting: true },
    });

    const actionItems = await prisma.actionItem.findMany({
      where: {
        OR: [
          { description: { contains: query } },
          { responsiblePerson: { contains: query } },
        ],
        meeting: { userId: session.userId },
      },
      include: { meeting: true },
    });

    return NextResponse.json({ meetings, transcripts, actionItems });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

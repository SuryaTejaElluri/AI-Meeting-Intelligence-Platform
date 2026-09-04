import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    const fileName = path.basename(meeting.fileUrl);
    const localPath = path.join(process.cwd(), 'public', 'uploads', fileName);
    const tmpPath = path.join(path.sep, 'tmp', 'uploads', fileName);

    let audioBuffer: Buffer | null = null;

    if (fs.existsSync(localPath)) {
      audioBuffer = await readFile(localPath);
    } else if (fs.existsSync(tmpPath)) {
      audioBuffer = await readFile(tmpPath);
    } else {
      // Fallback: Fetch audio binary directly from Postgres database
      const audioRecord = await prisma.meetingAudio.findUnique({
        where: { meetingId: meeting.id },
      });
      if (audioRecord) {
        audioBuffer = audioRecord.audioData;
      }
    }

    if (!audioBuffer) {
      return NextResponse.json({ error: 'Audio file content not found' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': meeting.fileType || 'audio/mp3',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Fetch Audio Error:', error);
    return NextResponse.json({ error: 'Failed to serve audio' }, { status: 500 });
  }
}

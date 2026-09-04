import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const chunk = formData.get('chunk') as File | null;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string || '0', 10);
    const totalChunks = parseInt(formData.get('totalChunks') as string || '1', 10);

    if (!chunk) {
      return NextResponse.json({ error: 'No chunk file provided' }, { status: 400 });
    }

    const meeting = await prisma.meeting.findFirst({
      where: { id: params.id, userId: session.userId },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const chunkBytes = await chunk.arrayBuffer();
    const chunkBuffer = Buffer.from(chunkBytes);

    // Retrieve existing audio data or start fresh
    const existingAudio = await prisma.meetingAudio.findUnique({
      where: { meetingId: meeting.id },
    });

    let combinedBuffer: Buffer;
    if (existingAudio) {
      combinedBuffer = Buffer.concat([existingAudio.audioData, chunkBuffer]);
      await prisma.meetingAudio.update({
        where: { meetingId: meeting.id },
        data: { audioData: combinedBuffer },
      });
    } else {
      combinedBuffer = chunkBuffer;
      await prisma.meetingAudio.create({
        data: {
          meetingId: meeting.id,
          audioData: combinedBuffer,
        },
      });
    }

    // On final chunk, complete the upload process
    const isFinalChunk = chunkIndex === totalChunks - 1;
    if (isFinalChunk) {
      // Save locally as well if possible (for local dev)
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });
        const fileName = path.basename(meeting.fileUrl);
        await writeFile(path.join(uploadsDir, fileName), combinedBuffer);
      } catch (e) {
        console.log('[UploadChunk] Local disk save skipped (read-only filesystem on Vercel)');
      }

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { status: 'PROCESSING' },
      });
    }

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      isFinalChunk,
    });
  } catch (error: any) {
    console.error('Upload Chunk Error:', error);
    return NextResponse.json({ error: error.message || 'Chunk upload failed' }, { status: 500 });
  }
}

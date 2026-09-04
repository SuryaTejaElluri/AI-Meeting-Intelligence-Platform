import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename;
    if (!filename) {
      return new NextResponse('Filename missing', { status: 400 });
    }

    // Check local public/uploads directory first, then /tmp/uploads on Vercel
    let filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    let fileBuffer: Buffer | null = null;

    if (fs.existsSync(filePath)) {
      fileBuffer = await readFile(filePath);
    } else {
      const tmpPath = path.join(path.sep, 'tmp', 'uploads', filename);
      if (fs.existsSync(tmpPath)) {
        fileBuffer = await readFile(tmpPath);
      } else {
        // Fallback: load audio from PostgreSQL database
        const { prisma } = await import('@/lib/prisma');
        const meeting = await prisma.meeting.findFirst({
          where: { fileUrl: { endsWith: filename } },
          include: { audio: true },
        });
        if (meeting?.audio?.audioData) {
          fileBuffer = meeting.audio.audioData;
        }
      }
    }

    if (!fileBuffer) {
      console.warn(`[Media Route] File not found on disk or database: ${filename}`);
      return new NextResponse('Media file not found', { status: 404 });
    }
    const ext = path.extname(filename).toLowerCase();
    
    const mimeMap: Record<string, string> = {
      '.mp3': 'audio/mp3',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.mp4': 'video/mp4',
      '.webm': 'audio/webm',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
    };
    const mimeType = mimeMap[ext] || 'audio/mpeg';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    console.error('[Media Route Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

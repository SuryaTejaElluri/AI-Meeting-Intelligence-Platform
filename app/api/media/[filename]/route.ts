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
    if (!fs.existsSync(filePath)) {
      const tmpPath = path.join(path.sep, 'tmp', 'uploads', filename);
      if (fs.existsSync(tmpPath)) {
        filePath = tmpPath;
      }
    }

    if (!fs.existsSync(filePath)) {
      console.warn(`[Media Route] File not found: ${filename}`);
      return new NextResponse('Media file not found', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
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

    return new NextResponse(fileBuffer, {
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

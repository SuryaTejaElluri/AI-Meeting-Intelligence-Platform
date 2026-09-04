import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for large file uploads

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetings = await prisma.meeting.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        summary: true,
        actionItems: true,
        decisions: true,
        topics: true,
      },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Fetch Meetings Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    // ──── 1. JSON Payload: Initialize Chunked Upload ────
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { title, fileName, fileSize, fileType } = body;

      if (!fileName || !fileSize) {
        return NextResponse.json({ error: 'fileName and fileSize are required' }, { status: 400 });
      }

      const cleanTitle = title || fileName.replace(/\.[^/.]+$/, '');
      const cleanFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

      const meeting = await prisma.meeting.create({
        data: {
          userId: session.userId,
          title: cleanTitle,
          fileUrl: `/uploads/${cleanFileName}`,
          fileType: fileType || 'audio/mp3',
          fileSize: Number(fileSize),
          status: 'UPLOADING',
        },
      });

      return NextResponse.json({ meeting });
    }

    // ──── 2. FormData Payload: Single Request Upload (<4MB) ────
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const titleInput = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio or video file uploaded' }, { status: 400 });
    }

    const title = titleInput || file.name.replace(/\.[^/.]+$/, '');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const isVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL);
    const uploadsDir = isVercel
      ? path.join(path.sep, 'tmp', 'uploads')
      : path.join(process.cwd(), 'public', 'uploads');

    try {
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
    } catch (e) {
      console.log('[Meetings POST] Read-only filesystem, saving to database only');
    }

    const fileUrl = `/uploads/${fileName}`;

    const meeting = await prisma.meeting.create({
      data: {
        userId: session.userId,
        title,
        fileUrl,
        fileType: file.type || 'audio/mp3',
        fileSize: file.size,
        status: 'PROCESSING',
      },
    });

    // Store in Postgres DB as well so Vercel stateless function can retrieve it
    await prisma.meetingAudio.upsert({
      where: { meetingId: meeting.id },
      create: { meetingId: meeting.id, audioData: buffer },
      update: { audioData: buffer },
    });

    return NextResponse.json({ meeting, message: 'File uploaded and processing initiated' });
  } catch (error: any) {
    console.error('Meeting Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

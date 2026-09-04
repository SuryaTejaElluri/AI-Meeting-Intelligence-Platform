import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

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

    // Determine upload directory: /tmp on Vercel serverless, public/uploads locally
    const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
    const uploadsDir = isVercel
      ? path.join(path.sep, 'tmp', 'uploads')
      : path.join(process.cwd(), 'public', 'uploads');

    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {}

    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

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

    return NextResponse.json({ meeting, message: 'File uploaded and processing initiated' });
  } catch (error) {
    console.error('Meeting Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

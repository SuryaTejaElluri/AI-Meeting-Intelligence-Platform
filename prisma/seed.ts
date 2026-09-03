import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial AI Meeting Platform demo data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Demo User
  const user = await prisma.user.upsert({
    where: { email: 'demo@meetingai.com' },
    update: {},
    create: {
      name: 'Alex Johnson',
      email: 'demo@meetingai.com',
      password: hashedPassword,
    },
  });

  // 2. Create Sample Meeting 1: Q4 Product Roadmap & Architecture Sync
  const meeting1 = await prisma.meeting.create({
    data: {
      userId: user.id,
      title: 'Q4 Product Roadmap & Architecture Sync',
      fileUrl: '/uploads/sample-recording-1.mp3',
      fileType: 'audio/mp3',
      fileSize: 14500000,
      duration: 95,
      status: 'COMPLETED',
    },
  });

  // Transcript
  const segments1 = [
    {
      start: 0,
      end: 14,
      speaker: 'Alex Johnson (Product Lead)',
      text: 'Welcome everyone to our Q4 Product Roadmap & Sprint Sync. Today we need to align on three main goals: finalizing the dark mode launch, reviewing our AI meeting backend architecture, and assigning key deliverables for next sprint.',
    },
    {
      start: 15,
      end: 32,
      speaker: 'Sarah Lin (Tech Lead)',
      text: 'Thanks Alex. On the technical backend side, we completed the Whisper Small transcription pipeline migration. Speech-to-text latency is down by 40%. Next step is configuring the open-source LLM parser for structured JSON action extraction.',
    },
    {
      start: 33,
      end: 48,
      speaker: 'David Kim (Senior Engineer)',
      text: 'I can take responsibility for integrating the open-source LLM structured prompts. I will have the action item and decision extractor unit tests completed by this Friday, September 12th.',
    },
    {
      start: 49,
      end: 65,
      speaker: 'Sarah Lin (Tech Lead)',
      text: 'Great David. We also decided to migrate all session auth logic to JWT tokens with 7-day expiration to improve API security across microservices.',
    },
    {
      start: 66,
      end: 82,
      speaker: 'Alex Johnson (Product Lead)',
      text: 'Excellent decision. Sarah, please draft the architecture documentation for the team by next Monday. Also, let us ensure we send out follow-up emails right after every design sync.',
    },
    {
      start: 83,
      end: 95,
      speaker: 'Sarah Lin (Tech Lead)',
      text: 'Understood Alex, I will post the updated architecture doc to Notion by Monday EOD.',
    },
  ];

  await prisma.transcript.create({
    data: {
      meetingId: meeting1.id,
      content: segments1.map((s) => `[${s.speaker}]: ${s.text}`).join('\n'),
      segments: JSON.stringify(segments1),
    },
  });

  await prisma.summary.create({
    data: {
      meetingId: meeting1.id,
      overview:
        'The team aligned on the Q4 Product Roadmap & Sprint Sync. Key focus areas include finalizing dark mode, optimizing the Whisper Small transcription pipeline, and deploying open-source LLM analytics.',
      keyDiscussionPts: JSON.stringify([
        'Whisper Small speech-to-text integration reduced STT latency by 40%.',
        'Session auth migration to JWT tokens with 7-day expiration for security compliance.',
        'Architecture documentation & follow-up email generator workflow.',
      ]),
      participants: JSON.stringify(['Alex Johnson (Product Lead)', 'Sarah Lin (Tech Lead)', 'David Kim (Senior Engineer)']),
    },
  });

  await prisma.actionItem.createMany({
    data: [
      {
        meetingId: meeting1.id,
        description: 'Integrate Open-Source LLM structured prompts and complete unit tests',
        responsiblePerson: 'David Kim',
        deadline: 'Friday, Sept 12',
        status: 'PENDING',
      },
      {
        meetingId: meeting1.id,
        description: 'Draft and publish updated backend architecture documentation to Notion',
        responsiblePerson: 'Sarah Lin',
        deadline: 'Monday EOD',
        status: 'PENDING',
      },
      {
        meetingId: meeting1.id,
        description: 'Automate post-meeting follow-up email workflow trigger',
        responsiblePerson: 'Alex Johnson',
        deadline: 'Next Sprint Sync',
        status: 'PENDING',
      },
    ],
  });

  await prisma.decision.createMany({
    data: [
      {
        meetingId: meeting1.id,
        description: 'Migrate all microservice session authentication logic to JWT tokens with 7-day expiration.',
        category: 'Security & Architecture',
      },
      {
        meetingId: meeting1.id,
        description: 'Standardize speech-to-text pipeline on openai/whisper-small model checkpoint.',
        category: 'AI Pipeline',
      },
      {
        meetingId: meeting1.id,
        description: 'Enforce mandatory follow-up email generation after every design sync.',
        category: 'Process & Operations',
      },
    ],
  });

  await prisma.topic.createMany({
    data: [
      {
        meetingId: meeting1.id,
        name: 'Q4 Product Roadmap & Objectives',
        summary: 'Alignment on sprint priorities and performance goals.',
        timestamp: '00:00 - 00:14',
      },
      {
        meetingId: meeting1.id,
        name: 'Whisper Small STT Pipeline',
        summary: 'Review of latency improvements and audio segment timestamps.',
        timestamp: '00:15 - 00:32',
      },
      {
        meetingId: meeting1.id,
        name: 'Open-Source LLM Integration',
        summary: 'Action item & decision extraction schema setup.',
        timestamp: '00:33 - 00:48',
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

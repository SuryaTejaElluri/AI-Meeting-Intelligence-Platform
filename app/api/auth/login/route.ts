import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, createToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ error: 'This account uses Google Sign-In. Please sign in with Google.' }, { status: 400 });
    }

    const valid = await comparePassword(password, user.password!);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createToken({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

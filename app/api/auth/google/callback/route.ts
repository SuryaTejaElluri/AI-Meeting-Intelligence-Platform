import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function getBaseUrl(req: Request) {
  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || (host && host.includes('localhost') ? 'http' : 'https');
  if (host && !host.includes('localhost')) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : 'http://localhost:3000');
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const baseUrl = getBaseUrl(req);

  if (error || !code) {
    console.error('[Google OAuth Error]:', error || 'No auth code provided');
    return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = (process.env.GOOGLE_CALLBACK_URL && !process.env.GOOGLE_CALLBACK_URL.includes('localhost'))
      ? process.env.GOOGLE_CALLBACK_URL
      : `${baseUrl}/api/auth/google/callback`;

    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[Google Token Exchange Failed]:', errText);
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=user_info_failed`);
    }

    const googleUser = await userRes.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=email_missing`);
    }

    // 3. Upsert user in Neon PostgreSQL
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          avatar: picture || null,
          password: null, // OAuth users don't have password
        },
      });
    } else if (picture && !user.avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture },
      });
    }

    // 4. Create JWT Session token and set HTTP-only cookie
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const cookieStore = cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    console.log(`[Google OAuth Success]: Logged in as ${user.email}`);
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err: any) {
    console.error('[Google OAuth Callback Error]:', err?.message || err);
    return NextResponse.redirect(`${baseUrl}/login?error=auth_exception`);
  }
}

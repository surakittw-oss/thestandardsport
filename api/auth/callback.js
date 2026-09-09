/**
 * Step 2 of the login flow: Google redirects back here with a `code`.
 * Exchange it for an id_token, verify the token's signature against
 * Google's own public keys, and only then check the `hd` (hosted domain)
 * claim — the one thing here an attacker cannot forge.
 */
import { jwtVerify, SignJWT, createRemoteJWKSet } from 'jose';

export const config = { runtime: 'edge' };

const ALLOWED_HD = process.env.ALLOWED_HD || 'thestandard.co';
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

function safePath(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
    ? path
    : '/';
}

export default async function handler(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const stateToken = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

  if (error || !code || !stateToken) {
    return new Response('เข้าสู่ระบบไม่สำเร็จ (ถูกยกเลิกหรือคำขอไม่ถูกต้อง)', {
      status: 400,
    });
  }

  let next = '/';
  try {
    const { payload } = await jwtVerify(stateToken, secret);
    next = safePath(payload.next);
  } catch {
    return new Response('ลิงก์เข้าสู่ระบบหมดอายุ กรุณาลองใหม่', { status: 400 });
  }

  const redirectUri = `${url.origin}/api/auth/callback`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return new Response('แลกโทเคนกับ Google ไม่สำเร็จ', { status: 502 });
  }

  const tokenData = await tokenRes.json();
  if (!tokenData.id_token) {
    return new Response('ไม่พบ id_token จาก Google', { status: 502 });
  }

  let claims;
  try {
    const { payload } = await jwtVerify(tokenData.id_token, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    claims = payload;
  } catch {
    return new Response('ยืนยันตัวตนกับ Google ไม่สำเร็จ', { status: 401 });
  }

  const email = typeof claims.email === 'string' ? claims.email : '';
  const emailVerified = claims.email_verified === true;
  // `hd` is only present on Workspace-issued tokens. Fall back to a plain
  // domain check on the (verified) email so a Workspace account that for
  // any reason omits `hd` doesn't get let in by accident.
  const domainOk = claims.hd === ALLOWED_HD || email.toLowerCase().endsWith('@' + ALLOWED_HD);

  if (!emailVerified || !domainOk) {
    return new Response(
      `เข้าถึงได้เฉพาะอีเมล @${ALLOWED_HD} เท่านั้น (บัญชีนี้คือ ${email || 'ไม่ทราบ'})`,
      { status: 403 }
    );
  }

  const session = await new SignJWT({ email, hd: ALLOWED_HD })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return new Response(null, {
    status: 302,
    headers: {
      Location: next,
      'Set-Cookie': `tsd_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
    },
  });
}

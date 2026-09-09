/**
 * Read + validate the env vars the login flow needs, and turn a missing
 * one into a readable error page instead of an opaque 500 crash.
 */
export class MissingEnvError extends Error {
  constructor(names) {
    super(`Missing required environment variable(s): ${names.join(', ')}`);
    this.names = names;
  }
}

export function getEnv() {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new MissingEnvError(missing);
  }
  return {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ALLOWED_HD: process.env.ALLOWED_HD || 'thestandard.co',
  };
}

export function envErrorResponse(err) {
  return new Response(
    'ตั้งค่าเซิร์ฟเวอร์ไม่ครบ — ไม่พบ environment variable: ' +
      err.names.join(', ') +
      '\n\nไปที่ Vercel → Project Settings → Environment Variables เพิ่มให้ครบ ' +
      'แล้ว Redeploy อีกครั้ง (ค่าที่เพิ่ง save จะมีผลกับ deployment ถัดไปเท่านั้น ' +
      'deployment เดิมจะไม่เห็นค่าที่เพิ่งเพิ่ม)',
    { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}

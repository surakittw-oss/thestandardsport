/**
 * Gate the entire static site behind Google Sign-In restricted to one
 * Workspace domain. Runs before Vercel serves any static file.
 *
 * The `/api/auth/*` routes are excluded (see `config.matcher`) — they are
 * the login/callback/logout endpoints themselves and must stay reachable
 * without a session.
 */
import { jwtVerify } from 'jose';

export const config = {
  matcher: ['/((?!api/).*)'],
};

const ALLOWED_HD = process.env.ALLOWED_HD || 'thestandard.co';

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') || '';
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const token = getCookie(request, 'tsd_session');

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (payload.hd === ALLOWED_HD) {
        return; // valid session — continue to the requested static file
      }
    } catch {
      // expired / tampered / wrong secret — fall through to login
    }
  }

  const loginUrl = new URL('/api/auth/login', request.url);
  loginUrl.searchParams.set('next', url.pathname + url.search);
  return Response.redirect(loginUrl, 302);
}

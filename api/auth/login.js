/**
 * Step 1 of the login flow: build the Google consent-screen URL and
 * redirect the browser there.
 *
 * `next` (where to send the user back to after login) is embedded inside
 * a short-lived signed token used as the OAuth `state` — that avoids
 * needing a second cookie just to survive the round trip to Google.
 */
import { SignJWT } from 'jose';

export const config = { runtime: 'edge' };

const ALLOWED_HD = process.env.ALLOWED_HD || 'thestandard.co';

function safePath(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
    ? path
    : '/';
}

export default async function handler(request) {
  const url = new URL(request.url);
  const next = safePath(url.searchParams.get('next'));

  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  const state = await new SignJWT({ next })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(secret);

  const redirectUri = `${url.origin}/api/auth/callback`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  // UI hint only — pre-filters the account chooser. Not a security
  // control by itself; the real check happens in callback.js against the
  // verified `hd` claim inside the signed id_token.
  authUrl.searchParams.set('hd', ALLOWED_HD);
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('state', state);

  return Response.redirect(authUrl.toString(), 302);
}

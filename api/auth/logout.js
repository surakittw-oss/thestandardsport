export const config = { runtime: 'edge' };

export default function handler(request) {
  const url = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.origin,
      'Set-Cookie': 'tsd_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}

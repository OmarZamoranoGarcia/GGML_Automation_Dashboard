import { requireRole } from '@/lib/auth-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  const auth = requireRole(request, '/dashboard');
  if (!auth.authorized) return auth.response;

  const apiURL = process.env.API_URL;

  if (!apiURL) {
    return Response.json(
      { ok: false, error: 'API_URL no está configurada en el servidor.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${apiURL}/api/Email/check`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return Response.json(
        { ok: false, error: data?.message || `Error ${response.status} desde el servicio de emails.` },
        { status: response.status }
      );
    }

    return Response.json({ ok: true, data });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || 'No se pudo contactar al servicio de emails.' },
      { status: 502 }
    );
  }
}
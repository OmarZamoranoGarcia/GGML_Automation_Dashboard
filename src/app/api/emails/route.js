import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireRole } from '@/lib/auth-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = requireRole(request, '/dashboard');
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return Response.json(
      { ok: false, error: 'Supabase admin client is not configured.' },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
  .from('emails_received')
  .select('*')
  .order('arrival_at', { ascending: false });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    data: data ?? [],
  });
}

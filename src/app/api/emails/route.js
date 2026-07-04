import { getSupabaseAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return Response.json(
      { ok: false, error: 'Supabase admin client is not configured.' },
      { status: 500 }
    );
  }

  const { data, error } = await supabase.from('emails_received').select('*');

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    data: data ?? [],
  });
}

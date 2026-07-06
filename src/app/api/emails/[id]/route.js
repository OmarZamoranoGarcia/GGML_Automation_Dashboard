import { getSupabaseAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guard';

const EMAIL_FILES_BUCKET = process.env.EMAIL_FILES_BUCKET;
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;

function getStoragePath(path) {
  if (!path) return '';

  return path.startsWith(`${EMAIL_FILES_BUCKET}/`)
    ? path.slice(EMAIL_FILES_BUCKET.length + 1)
    : path;
}

export async function GET(request, { params }) {
  try {
    const auth = requireRole(request, '/dashboard');
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: 'Supabase admin client is not configured.' },
        { status: 500 }
      );
    }

    // Obtener archivos del correo
    const { data: files, error } = await supabase
      .from('email_files')
      .select('*')
      .eq('email_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching files:', error);
      return NextResponse.json(
        { ok: false, error: error.message || 'Error al obtener archivos' },
        { status: 500 }
      );
    }

    // Generar URLs firmadas para cada archivo
    const filesWithUrls = await Promise.all(
      (files ?? []).map(async (file) => {
        const storagePath = getStoragePath(file.storage_path);
        const { data, error: signedUrlError } = await supabase.storage
          .from(EMAIL_FILES_BUCKET)
          .createSignedUrl(storagePath, SIGNED_URL_EXPIRES_IN_SECONDS);

        if (signedUrlError) {
          throw new Error(signedUrlError.message);
        }

        return {
          ...file,
          public_url: data.signedUrl,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      data: filesWithUrls,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

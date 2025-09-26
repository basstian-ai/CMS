import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getRouteClient, handleAuthError } from '@/lib/auth';
import { pageUpdateSchema } from '@/lib/validation';

export const runtime = 'edge';

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || (data.status !== 'published' && process.env.NODE_ENV === 'production')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 's-maxage=60, stale-while-revalidate'
    }
  });
}

async function ensureEditor() {
  const client = getRouteClient();
  const {
    data: { user }
  } = await client.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  const { data: role } = await client
    .from('roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!role || (role.role !== 'admin' && role.role !== 'editor')) {
    throw new Error('Forbidden');
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await ensureEditor();
    const payload = pageUpdateSchema.parse(await request.json());
    const update: Record<string, unknown> = {};
    if (payload.slug) update.slug = payload.slug;
    if (payload.title) update.title = payload.title;
    if (payload.status) update.status = payload.status;
    if (payload.meta) update.meta = payload.meta;
    if (payload.blocks) update.blocks = payload.blocks;
    if (payload.publishedAt !== undefined) update.published_at = payload.publishedAt;
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cms_pages')
      .update(update)
      .eq('slug', params.slug)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, ctx: { params: { slug: string } }) {
  return PUT(request, ctx);
}

export async function DELETE(_: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await ensureEditor();
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('cms_pages').delete().eq('slug', params.slug);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}

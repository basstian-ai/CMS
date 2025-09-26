import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getRouteClient, handleAuthError } from '@/lib/auth';
import { categorySchema } from '@/lib/validation';

export const runtime = 'edge';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('pim_categories')
    .select('id, name, slug, parent_id')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: data.id,
    name: data.name,
    slug: data.slug,
    parentId: data.parent_id
  });
}

async function ensureEditor() {
  const client = getRouteClient();
  const {
    data: { user }
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: role } = await client.from('roles').select('role').eq('user_id', user.id).maybeSingle();
  if (!role || (role.role !== 'admin' && role.role !== 'editor')) {
    throw new Error('Forbidden');
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureEditor();
    const payload = categorySchema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('pim_categories')
      .update({
        name: payload.name,
        slug: payload.slug,
        parent_id: payload.parentId ?? null
      })
      .eq('id', params.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureEditor();
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('pim_categories').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}

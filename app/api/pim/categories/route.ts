import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { categorySchema } from '@/lib/validation';
import { getRouteClient, handleAuthError } from '@/lib/auth';

export const runtime = 'edge';

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

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('pim_categories')
    .select('id, name, slug, parent_id')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      items: (data ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parent_id
      }))
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=60, stale-while-revalidate'
      }
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    await ensureEditor();
    const body = await request.json();
    const payload = categorySchema.parse(body);
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('pim_categories')
      .insert({
        name: payload.name,
        slug: payload.slug,
        parent_id: payload.parentId ?? null
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

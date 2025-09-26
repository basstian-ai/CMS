import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getRouteClient, handleAuthError } from '@/lib/auth';
import { pageCreateSchema } from '@/lib/validation';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0)
});

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const params = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const { data, error, count } = await supabase
    .from('cms_pages')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .range(params.offset, params.offset + params.limit - 1)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      items: data ?? [],
      total: count ?? 0
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
    const body = await request.json();
    const parsed = pageCreateSchema.parse(body);
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cms_pages')
      .insert({
        slug: parsed.slug,
        title: parsed.title,
        status: parsed.status,
        meta: parsed.meta ?? {},
        blocks: parsed.blocks ?? []
      })
      .select()
      .single();
    if (error) {
      throw error;
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

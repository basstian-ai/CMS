import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getRouteClient, handleAuthError } from '@/lib/auth';
import { productSchema } from '@/lib/validation';
import { z } from 'zod';

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0)
});

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

export async function GET(request: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const parsed = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

  let query = supabase
    .from('pim_products')
    .select('id, sku, name, description, default_image_url, attributes, brand', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(parsed.offset, parsed.offset + parsed.limit - 1);

  if (parsed.search) {
    query = query.ilike('name', `%${parsed.search}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let items = data ?? [];
  if (parsed.category) {
    const { data: relations } = await supabase
      .from('pim_product_categories')
      .select('product_id')
      .eq('category_id', parsed.category);
    const allowed = new Set(relations?.map((r) => r.product_id));
    items = items.filter((item) => allowed.has(item.id));
  }

  return NextResponse.json(
    {
      items: items.map((item) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        brand: item.brand,
        defaultImageUrl: item.default_image_url
      })),
      total: count ?? items.length
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
    const payload = productSchema.parse(body);
    const supabase = createSupabaseAdminClient();
    const { data: product, error: productError } = await supabase
      .from('pim_products')
      .insert({
        sku: payload.sku,
        name: payload.name,
        description: payload.description ?? null,
        brand: payload.brand ?? null,
        attributes: payload.attributes ?? {},
        default_image_url: payload.defaultImageUrl ?? null
      })
      .select()
      .single();
    if (productError || !product) {
      throw productError ?? new Error('Product creation failed');
    }

    const variants = payload.variants.map((variant) => ({
      product_id: product.id,
      sku: variant.sku,
      name: variant.name,
      price_cents: variant.priceCents,
      currency: variant.currency ?? 'NOK'
    }));
    const { data: insertedVariants, error: variantError } = await supabase
      .from('pim_variants')
      .insert(variants)
      .select();
    if (variantError) throw variantError;

    if (payload.categories.length) {
      await supabase
        .from('pim_product_categories')
        .insert(payload.categories.map((categoryId) => ({ product_id: product.id, category_id: categoryId })));
    }

    if (insertedVariants?.length) {
      await supabase
        .from('stock_levels')
        .insert(
          insertedVariants.map((variant, index) => ({
            variant_id: variant.id,
            quantity: payload.variants[index]?.stockQty ?? 0
          }))
        );
    }

    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

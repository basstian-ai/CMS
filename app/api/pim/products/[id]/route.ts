import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const runtime = 'edge';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  const { data: product, error } = await supabase
    .from('pim_products')
    .select('id, sku, name, description, brand, attributes, default_image_url')
    .eq('id', params.id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: categoryLinks } = await supabase
    .from('pim_product_categories')
    .select('category_id')
    .eq('product_id', product.id);

  const categoryIds = categoryLinks?.map((link) => link.category_id) ?? [];

  const { data: categories } = categoryIds.length
    ? await supabase.from('pim_categories').select('id, name, slug').in('id', categoryIds)
    : { data: [] };

  const { data: variants } = await supabase
    .from('pim_variants')
    .select('id, sku, name, price_cents, currency')
    .eq('product_id', product.id);

  const { data: stockLevels } = await supabase
    .from('stock_levels')
    .select('variant_id, quantity');

  const stockMap = new Map((stockLevels ?? []).map((row) => [row.variant_id, row.quantity]));

  return NextResponse.json({
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    brand: product.brand,
    attributes: product.attributes ?? {},
    defaultImageUrl: product.default_image_url,
    categories: (categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug
    })),
    variants: (variants ?? []).map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      priceCents: variant.price_cents,
      currency: variant.currency,
      stockQty: stockMap.get(variant.id) ?? 0
    }))
  });
}

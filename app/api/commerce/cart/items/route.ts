import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { cartAddItemSchema } from '@/lib/validation';
import type { CartResponse } from '@/lib/dto';
import { calculateTotals } from '@/lib/cart';

export const runtime = 'edge';

const CART_COOKIE = 'cart_session';

async function getOrCreateCart(sessionId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('carts')
    .upsert({ session_id: sessionId }, { onConflict: 'session_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function recalc(cartId: string): Promise<CartResponse> {
  const supabase = createSupabaseAdminClient();
  const { data: items } = await supabase
    .from('cart_items')
    .select('id, variant_id, qty, unit_price_cents, row_total_cents, pim_variants(sku, name)')
    .eq('cart_id', cartId);
  const cartItems: CartResponse['items'] = (items ?? []).map((item) => {
    const variant = Array.isArray(item.pim_variants) ? item.pim_variants[0] : item.pim_variants;
    return {
      id: item.id,
      variantId: item.variant_id,
      sku: variant?.sku ?? '',
      name: variant?.name ?? '',
      qty: item.qty,
      unitPriceCents: item.unit_price_cents,
      rowTotalCents: item.row_total_cents
    };
  });
  const totals = calculateTotals(cartItems);
  await supabase
    .from('carts')
    .update({ subtotal_cents: totals.subtotalCents, total_cents: totals.totalCents })
    .eq('id', cartId);
  const { data: cart } = await supabase.from('carts').select('*').eq('id', cartId).single();
  return {
    cartId,
    currency: cart.currency,
    items: cartItems,
    totals
  };
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  const payload = cartAddItemSchema.parse(await request.json());
  const cart = await getOrCreateCart(sessionId);
  const supabase = createSupabaseAdminClient();
  const { data: variant, error: variantError } = await supabase
    .from('pim_variants')
    .select('id, price_cents, currency, sku, name')
    .eq('id', payload.variantId)
    .maybeSingle();
  if (variantError || !variant) {
    return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('variant_id', variant.id)
    .maybeSingle();

  const qty = existing ? existing.qty + payload.qty : payload.qty;
  const rowTotal = qty * variant.price_cents;

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ qty, unit_price_cents: variant.price_cents, row_total_cents: rowTotal })
      .eq('id', existing.id);
  } else {
    await supabase.from('cart_items').insert({
      cart_id: cart.id,
      variant_id: variant.id,
      qty,
      unit_price_cents: variant.price_cents,
      row_total_cents: rowTotal
    });
  }

  const response = NextResponse.json(await recalc(cart.id));
  response.cookies.set({
    name: CART_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}

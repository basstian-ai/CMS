import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import type { CartResponse } from '@/lib/dto';

export const runtime = 'edge';

const CART_COOKIE = 'cart_session';

async function fetchCart(sessionId: string): Promise<CartResponse | null> {
  const supabase = createSupabaseAdminClient();
  const { data: cart } = await supabase
    .from('carts')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (!cart) return null;
  const { data: items } = await supabase
    .from('cart_items')
    .select('id, variant_id, qty, unit_price_cents, row_total_cents, pim_variants(sku, name)')
    .eq('cart_id', cart.id);
  return {
    cartId: cart.id,
    currency: cart.currency,
    items: (items ?? []).map((item) => {
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
    }),
    totals: {
      subtotalCents: cart.subtotal_cents,
      totalCents: cart.total_cents
    }
  };
}

async function ensureCart(sessionId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('carts')
    .upsert({ session_id: sessionId }, { onConflict: 'session_id' });
  if (error) throw error;
}

const emptyCart: CartResponse = {
  cartId: '',
  currency: 'NOK',
  items: [],
  totals: { subtotalCents: 0, totalCents: 0 }
};

export async function GET() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json(emptyCart);
  }
  const cart = await fetchCart(sessionId);
  if (!cart) {
    return NextResponse.json(emptyCart);
  }
  return NextResponse.json(cart);
}

export async function POST() {
  const cookieStore = cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  await ensureCart(sessionId);
  const cart = (await fetchCart(sessionId)) ?? { ...emptyCart, cartId: sessionId };
  const response = NextResponse.json(cart);
  response.cookies.set({
    name: CART_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}

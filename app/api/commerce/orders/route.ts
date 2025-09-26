import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getRouteClient, handleAuthError } from '@/lib/auth';
import { orderCheckoutSchema } from '@/lib/validation';

export const runtime = 'edge';

const CART_COOKIE = 'cart_session';

async function ensureCustomer(userId: string, email: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('customers')
    .upsert({ id: userId, email }, { onConflict: 'email' });
  if (error) throw error;
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (!data) {
    throw new Error('Customer creation failed');
  }
  return data;
}

export async function GET() {
  try {
    const client = getRouteClient();
    const {
      data: { user }
    } = await client.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    const supabase = createSupabaseAdminClient();
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    if (!customer) {
      return NextResponse.json({ items: [] });
    }
    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, total_cents, currency, placed_at')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });
    return NextResponse.json({
      items: (orders ?? []).map((order) => ({
        id: order.id,
        status: order.status,
        totalCents: order.total_cents,
        currency: order.currency,
        placedAt: order.placed_at
      }))
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: Request) {
  try {
    const client = getRouteClient();
    const {
      data: { user }
    } = await client.auth.getUser();
    if (!user || !user.email) {
      throw new Error('Not authenticated');
    }
    const payload = orderCheckoutSchema.parse(await request.json());
    const cookieStore = cookies();
    const sessionId = cookieStore.get(CART_COOKIE)?.value;
    if (!sessionId) {
      throw new Error('Cart session missing');
    }
    const supabase = createSupabaseAdminClient();
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('id', payload.cartId)
      .eq('session_id', sessionId)
      .maybeSingle();
    if (cartError || !cart) {
      throw new Error('Cart not found');
    }
    const { data: items } = await supabase
      .from('cart_items')
      .select('id, variant_id, qty, unit_price_cents, row_total_cents, pim_variants(product_id, sku, name)')
      .eq('cart_id', cart.id);
    if (!items?.length) {
      throw new Error('Cart empty');
    }
    const customer = await ensureCustomer(user.id, user.email);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        subtotal_cents: cart.subtotal_cents,
        total_cents: cart.total_cents,
        currency: cart.currency,
        placed_at: new Date().toISOString(),
        status: 'created'
      })
      .select()
      .single();
    if (orderError || !order) {
      throw orderError ?? new Error('Order creation failed');
    }
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.pim_variants?.product_id ?? null,
      variant_id: item.variant_id,
      sku: item.pim_variants?.sku ?? '',
      name: item.pim_variants?.name ?? '',
      qty: item.qty,
      unit_price_cents: item.unit_price_cents,
      row_total_cents: item.row_total_cents
    }));
    await supabase.from('order_items').insert(orderItems);
    await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    await supabase
      .from('carts')
      .update({ subtotal_cents: 0, total_cents: 0 })
      .eq('id', cart.id);

    return NextResponse.json({ orderId: order.id, status: order.status });
  } catch (error) {
    return handleAuthError(error);
  }
}

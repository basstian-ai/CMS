import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('id, status, total_cents, currency, placed_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <THead>
            <TR>
              <TH>Order ID</TH>
              <TH>Status</TH>
              <TH>Total</TH>
              <TH>Placed</TH>
            </TR>
          </THead>
          <TBody>
            {(data ?? []).map((order) => (
              <TR key={order.id}>
                <TD className="font-mono text-xs">{order.id}</TD>
                <TD>{order.status}</TD>
                <TD>{(order.total_cents / 100).toFixed(2)} {order.currency}</TD>
                <TD>{order.placed_at ? new Date(order.placed_at).toLocaleString() : '-'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}

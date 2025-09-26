import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const [pages, products, orders] = await Promise.all([
    supabase.from('cms_pages').select('id', { count: 'exact', head: true }),
    supabase.from('pim_products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true })
  ]);

  const { data: recentPages } = await supabase
    .from('cms_pages')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Stat label="Pages" value={pages.count ?? 0} href="/(admin)/content/pages" />
          <Stat label="Products" value={products.count ?? 0} href="/(admin)/pim/products" />
          <Stat label="Orders" value={orders.count ?? 0} href="/(admin)/orders" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(recentPages ?? []).map((page) => (
              <li key={page.id} className="rounded border border-slate-200 px-3 py-2">
                <p className="text-sm font-medium">{page.title}</p>
                <p className="text-xs text-slate-500">{new Date(page.updated_at).toLocaleString()}</p>
              </li>
            ))}
            {!recentPages?.length && <p className="text-sm text-slate-500">No activity yet.</p>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </Link>
  );
}

import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductManager } from './productManager';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('pim_products')
      .select('id, sku, name, description, brand, default_image_url, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('pim_categories').select('id, name, slug').order('name')
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductManager initialProducts={products ?? []} categories={categories ?? []} />
      </CardContent>
    </Card>
  );
}

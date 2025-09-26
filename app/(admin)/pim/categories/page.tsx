import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryManager } from './categoryManager';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('pim_categories')
    .select('id, name, slug, parent_id, created_at')
    .order('created_at', { ascending: false });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <CategoryManager initialCategories={data ?? []} />
      </CardContent>
    </Card>
  );
}

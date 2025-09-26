import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageManager } from './pageManager';

export const dynamic = 'force-dynamic';

export default async function ContentPages() {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('cms_pages')
    .select('id, slug, title, status, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <PageManager initialPages={data ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}

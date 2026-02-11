import Link from 'next/link';
import { notFound } from 'next/navigation';

import { deletePost, updatePost } from "@/app/admin/posts/actions";
import { LanguageToggleFields } from "@/components/admin/language-toggle-fields";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { SlugField } from "@/components/admin/slug-field";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDateTime(value: string | null) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 16);
}

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: post } = await supabase
    .from('posts')
    .select(
      'id, slug, title, excerpt, content_md, status, published_at, cover_image_path',
    )
    .eq('id', params.id)
    .single();

  const { data: media } = await supabase
    .from('media')
    .select('id, bucket, path, alt, caption')
    .order('updated_at', { ascending: false })
    .limit(120);

  const mediaWithUrls =
    media?.map((item) => {
      const { data } = supabase.storage
        .from(item.bucket)
        .getPublicUrl(item.path);
      return {
        id: item.id,
        bucket: item.bucket,
        path: item.path,
        alt: item.alt,
        caption: item.caption,
        publicUrl: data.publicUrl,
      };
    }) ?? [];

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Innlegg
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">
            {post.title?.no ?? 'Uten tittel'}
          </h2>
        </div>
        <Link
          href="/admin/posts"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Tilbake
        </Link>
      </div>

      <form action={updatePost.bind(null, post.id)} className="space-y-6">
        <LanguageToggleFields
          noContent={
            <div className="space-y-4">
              <label className="space-y-2 text-sm text-slate-200">
                Tittel (NO)
                <input
                  name="title"
                  required
                  defaultValue={post.title?.no ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Sammendrag (NO)
                <textarea
                  name="excerpt"
                  rows={3}
                  defaultValue={post.excerpt?.no ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <MarkdownEditor
                label="Innhold (NO)"
                name="content"
                recordId={`post-${post.id}`}
                rows={12}
                defaultValue={post.content_md?.no ?? ""}
              />
            </div>
          }
          enContent={
            <div className="space-y-4">
              <label className="space-y-2 text-sm text-slate-200">
                Tittel (EN)
                <input
                  name="title_en"
                  defaultValue={post.title?.en ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Sammendrag (EN)
                <textarea
                  name="excerpt_en"
                  rows={3}
                  defaultValue={post.excerpt?.en ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <MarkdownEditor
                label="Innhold (EN)"
                name="content_en"
                recordId={`post-${post.id}`}
                rows={12}
                defaultValue={post.content_md?.en ?? ""}
              />
            </div>
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SlugField
            initialSlug={post.slug}
            slugName="slug"
            titleInputName="title"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-200">
            Status
            <select
              name="status"
              defaultValue={post.status}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            >
              <option value="draft">Kladd</option>
              <option value="published">Publisert</option>
              <option value="archived">Arkivert</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Publisert dato
            <input
              type="datetime-local"
              name="published_at"
              defaultValue={formatDateTime(post.published_at)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <div className="space-y-2 text-sm text-slate-200">
            Cover image
            <MediaPicker
              items={mediaWithUrls}
              inputName="cover_image_path"
              initialValue={post.cover_image_path}
              label="Select image"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
          >
            Lagre endringer
          </button>
          <button
            type="submit"
            formAction={deletePost.bind(null, post.id)}
            className="rounded-full border border-rose-500/60 px-5 py-2 text-sm font-semibold text-rose-200"
          >
            Slett innlegg
          </button>
        </div>
      </form>
    </div>
  );
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server';

const editorRoles = new Set(['admin', 'editor']);
const allowedBuckets = new Set(['images', 'podcasts']);

async function requireEditorUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated.');
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile || !editorRoles.has(profile.role)) {
    throw new Error('User does not have permission to manage media.');
  }

  return { adminClient };
}

function resolveBucket(value: string | null) {
  if (value && allowedBuckets.has(value)) {
    return value;
  }
  return 'images';
}

export async function uploadMedia(formData: FormData) {
  const { adminClient } = await requireEditorUser();
  const bucket = resolveBucket(formData.get('bucket')?.toString() ?? null);
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('No file selected.');
  }

  const rawPath = formData.get('path')?.toString().trim() ?? '';
  const path = (rawPath || file.name).replace(/^\/+/, '');
  const alt = formData.get('alt')?.toString().trim() ?? '';
  const caption = formData.get('caption')?.toString().trim() ?? '';

  const { error: uploadError } = await adminClient.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: insertError } = await adminClient.from('media').upsert(
    {
      bucket,
      path,
      alt: { no: alt },
      caption: caption ? { no: caption } : null,
    },
    { onConflict: 'bucket,path' },
  );

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath('/admin/media');
  redirect('/admin/media');
}

export async function updateMediaMetadata(mediaId: string, formData: FormData) {
  const { adminClient } = await requireEditorUser();

  const alt = formData.get('alt')?.toString().trim() ?? '';
  const caption = formData.get('caption')?.toString().trim() ?? '';

  const { error } = await adminClient
    .from('media')
    .update({
      alt: { no: alt },
      caption: caption ? { no: caption } : null,
    })
    .eq('id', mediaId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/media');
  revalidatePath('/admin/posts');
}

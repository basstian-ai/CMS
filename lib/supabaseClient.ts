'use client';

import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export const createSupabaseBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase browser credentials are missing');
  }
  return createBrowserClient(url, anonKey);
};

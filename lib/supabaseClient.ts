'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './supabase.types';

export const createSupabaseBrowserClient = () => {
  return createClientComponentClient<Database>();
};

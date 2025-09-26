import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './supabase.types';

export const getServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

export const getRouteClient = () => {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore });
};

export const requireAdmin = async () => {
  const supabase = getServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  const { data: role } = await supabase.from('roles').select('role').eq('user_id', user.id).maybeSingle();
  if (!role || (role.role !== 'admin' && role.role !== 'editor')) {
    throw new Error('Insufficient permissions');
  }
  return { user, role: role.role } as const;
};

export const handleAuthError = (error: unknown) => {
  console.error(error);
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
};

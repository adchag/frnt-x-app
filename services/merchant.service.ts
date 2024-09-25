'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
type Database = any;

export interface Merchant {
  id: string;
  company_name: string;
  logo: any;
  description: string | null;
  files?: any[];
  created_at: string;
  updated_at: string;
}

export const getMerchants = async (): Promise<Merchant[]> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .order('company_name', { ascending: true });

  if (error) throw error;
  return data as Merchant[];
};

export const getMerchant = async (id: string): Promise<Merchant | null> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Merchant;
};

export const createMerchant = async (
  merchant: Omit<Merchant, 'id' | 'created_at' | 'updated_at'>
): Promise<Merchant> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('merchants')
    .insert(merchant)
    .select()
    .single();

  if (error) throw error;
  return data as Merchant;
};

export const updateMerchant = async (
  id: string,
  merchant: Partial<Omit<Merchant, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { error } = await supabase
    .from('merchants')
    .update(merchant)
    .eq('id', id);

  if (error) throw error;
};

export const deleteMerchant = async (id: string): Promise<void> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { error } = await supabase
    .from('merchants')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

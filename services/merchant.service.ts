'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
type Database = any;

export interface MerchantMandate {
  id: string;
  company_name: string;
  logo: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const getMerchantMandates = async (): Promise<MerchantMandate[]> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('merchant_mandates')
    .select('*')
    .order('company_name', { ascending: true });

  if (error) throw error;
  return data as MerchantMandate[];
};

export const getMerchantMandate = async (id: string): Promise<MerchantMandate | null> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('merchant_mandates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as MerchantMandate;
};

export const createMerchantMandate = async (
  mandate: Omit<MerchantMandate, 'id' | 'created_at' | 'updated_at'>
): Promise<MerchantMandate> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('merchant_mandates')
    .insert(mandate)
    .select()
    .single();

  if (error) throw error;
  return data as MerchantMandate;
};

export const updateMerchantMandate = async (
  id: string,
  mandate: Partial<Omit<MerchantMandate, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { error } = await supabase
    .from('merchant_mandates')
    .update(mandate)
    .eq('id', id);

  if (error) throw error;
};

export const deleteMerchantMandate = async (id: string): Promise<void> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { error } = await supabase
    .from('merchant_mandates')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

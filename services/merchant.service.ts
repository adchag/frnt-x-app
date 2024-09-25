'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
type Database = any;

export interface Merchant {
  id: string;
  company_name: string;
  logo: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MerchantFile {
  id: string;
  url: string;
  file: any;
  name: string;
  size: number;
  type: string;
  progress: number;
  is_deleting: boolean;
  is_uploading: boolean;
  merchant_id: string;
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

export const getMerchant = async (id: string): Promise<{ merchant: Merchant | null, files: MerchantFile[] }> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .single();

  if (merchantError) throw merchantError;

  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('*')
    .eq('merchant_id', id);

  if (filesError) throw filesError;

  return { merchant, files };
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

export const getMerchantFiles = async (merchant_id: string): Promise<MerchantFile[]> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('merchant_id', merchant_id);
  return data as MerchantFile[];
};


export const updateMerchantFiles = async (merchant_id: string, files: MerchantFile[]): Promise<void> => {
  const existingFiles = await getMerchantFiles(merchant_id);
  const filesToAdd = files.filter(file => !existingFiles.some(existingFile => existingFile.id === file.id));
  const filesToDelete = existingFiles.filter(existingFile => !files.some(file => file.id === existingFile.id));

  for (const file of filesToDelete) {
    await deleteMerchantFile(file.id);
  }

  for (const file of filesToAdd) {
    await addMerchantFile(file);
  }
}

export const addMerchantFile = async (file: Omit<MerchantFile, 'id' | 'created_at' | 'updated_at'>): Promise<MerchantFile> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('files')
    .insert(file)
    .select()
    .single();

  if (error) throw error;
  return data as MerchantFile;
};

export const deleteMerchantFile = async (fileId: string): Promise<void> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (error) throw error;
};

'use server';

import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const getSupabase = () => {
  const cookieStore = cookies();
  return createClient(cookieStore);
};

export const upload_file = async (formData: FormData) => {
  const supabase = getSupabase();
  const file = formData.get('file') as File;
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return data;
};

export const download_file = async (path: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from('pdfs')
    .download(path);

  if (error) throw error;
  return data;
};

export const delete_file = async (path: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from('pdfs')
    .remove([path]);

  if (error) throw error;
  return data;
};

export const list_files = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from('pdfs')
    .list();

  if (error) throw error;
  return data;
};
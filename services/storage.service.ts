'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const getSupabase = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};

export async function upload_file(formData: FormData) {
  const supabase = getSupabase();
  const file = formData.get('file') as File;
  const fileName = file.name;

  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data;
}

export async function get_file_url(path: string): Promise<string> {
  const supabase = getSupabase();
  const { data } = supabase.storage.from('pdfs').getPublicUrl(path);
  return data.publicUrl;
}

export async function delete_file(path: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from('pdfs')
    .remove([path]);

  if (error) throw error;
  return data;
}

export async function list_files() {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from('pdfs')
    .list();

  if (error) throw error;
  return data;
}
'use server'

import { createClient } from '@supabase/supabase-js';
import { extractTextFromPDF } from '@/services/openai.service';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const uploadAndConvertPDF = async (formData: FormData) => {
  const file = formData.get('pdf') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `pdfs/${fileName}`;

  try {
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf-uploads')
      .upload(filePath, file);

    if (uploadError) throw new Error('Failed to upload file');

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // const extractedText = await extractTextFromPDF(buffer);

    // Insert record into pdf_files table
    const { data: insertData, error: insertError } = await supabase
      .from('pdf_files')
      .insert({
        file_name: file.name,
        file_path: filePath,
        // extracted_text: extractedText,
      })
      .select()
      .single();

    if (insertError) throw new Error('Failed to insert file record');

    return { 
      id: insertData.id,
      fileName: file.name,
      // text: extractedText 
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF');
  }
};

export const deletePDF = async (id: string) => {
  try {
    // Get file path from database
    const { data: fileData, error: fileError } = await supabase
      .from('pdf_files')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fileError) throw new Error('Failed to fetch file data');

    // Delete file from storage
    const { error: deleteStorageError } = await supabase.storage
      .from('pdf-uploads')
      .remove([fileData.file_path]);

    if (deleteStorageError) throw new Error('Failed to delete file from storage');

    // Delete record from database
    const { error: deleteDbError } = await supabase
      .from('pdf_files')
      .delete()
      .eq('id', id);

    if (deleteDbError) throw new Error('Failed to delete file record from database');

    return { success: true };
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw new Error('Failed to delete PDF');
  }
};

export const getPDFList = async () => {
  try {
    const { data, error } = await supabase
      .from('pdf_files')
      .select('id, file_name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching PDF list:', error);
    throw new Error('Failed to fetch PDF list');
  }
};
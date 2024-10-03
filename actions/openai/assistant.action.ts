'use server';

import OpenAI from "openai";
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { Vector } from "@/types/openai/vector.type";
import { VectorStore, VectorStoresPage } from "openai/resources/beta/vector-stores/vector-stores.mjs";
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// list assistants
export const list_assistants = async () => {
  const assistants = await openai.beta.assistants.list();
  return assistants.data;
};

// Get a specific assistant
export const get_assistant = async (assistantId: string) => {
  const assistant = await openai.beta.assistants.retrieve(assistantId);
  return assistant;
};

// List threads for a specific assistant
export const list_assistant_threads = async (assistantId: string) => {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .eq('assistant_id', assistantId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Create a new thread for an assistant
export const create_thread = async (assistantId: string) => {
  const supabase = createClient(cookies());
  const thread = await openai.beta.threads.create();
  
  const { data, error } = await supabase
    .from('threads')
    .insert({
      id: thread.id,
      object: thread.object,
      created_at: thread.created_at,
      metadata: thread.metadata,
      tool_resources: thread.tool_resources,
      assistant_id: assistantId
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const delete_thread = async (threadId: string) => {
  const supabase = createClient(cookies());
  // delete the thread from openai
  await openai.beta.threads.del(threadId);

  const { error } = await supabase
    .from('threads')
    .delete()
    .eq('id', threadId);


  if (error) throw new Error(error.message);
  return true;
};

// Get a specific thread
export const get_thread = async (threadId: string) => {
  const thread = await openai.beta.threads.retrieve(threadId);
  return thread;
};

// Create a new message in a thread
export const create_message = async (threadId: string, content: string) => {
  const message = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });
  return message;
};

// Run an assistant in a thread
export const run_assistant = async (threadId: string, assistantId: string) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
  return run;
};

// Get messages in a thread
export const get_messages = async (threadId: string) => {
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages.data;
};

// Check the status of a run
export const check_run_status = async (threadId: string, runId: string) => {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);
  return run;
};

export const update_assistant = async (assistantId: string, data: any) => {
  const assistant = await openai.beta.assistants.update(assistantId, {
    name: data.name,
    description: data.description,
    instructions: data.instructions,
    model: data.model,
    temperature: data.temperature,
    response_format: data.response_format,
    // Add other fields as needed
  });
  return assistant;
};

export const send_message_to_thread = async (threadId: string, assistantId: string, content: string) => {
  const message = await create_message(threadId, content);
  const run = await run_assistant(threadId, assistantId);
  
  // Wait for the run to complete
  let runStatus = await check_run_status(threadId, run.id);
  while (runStatus.status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await check_run_status(threadId, run.id);
  }

  // Fetch the latest messages after the run is completed
  const messages = await get_messages(threadId);
  return messages[0]; // Return the first message (assistant's response)
};

// List vectors
export const list_vectors = async (): Promise<any> => {
  const vectors = await openai.beta.vectorStores.list();
  return vectors.data;
};

// Attach vector to assistant
export const attach_vector = async (assistantId: string, vectorStoreIds: string[]) => {
  const assistant = await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: {
        vector_store_ids: vectorStoreIds,
      },
    },
  });
  return assistant;
};

// Upload vector
export const upload_vector = async (name: string) => {
  const vectorStore = await openai.beta.vectorStores.create({
    name: name,
  });
  return vectorStore;
};

// Update vector name
export const update_vector = async (vectorId: string, name: string) => {
  const updatedVector = await openai.beta.vectorStores.update(vectorId, {
    name: name,
  });
  return updatedVector;
};

// Upload file to vector store
export const upload_file_to_vector = async (vectorId: string, file: File) => {
  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });

  const vectorFile = await openai.beta.vectorStores.files.create(vectorId, {
    file_id: openaiFile.id,
  });

  return vectorFile;
};

// List files in vector store
export const list_vector_files = async (vectorId: string) => {
  const files = await openai.beta.vectorStores.files.list(vectorId);
  return files.data;
};

// Delete file from vector store
export const delete_vector_file = async (vectorId: string, fileId: string) => {
  await openai.beta.vectorStores.files.del(vectorId, fileId);
};

// Download vector file
export const download_vector_file = async (fileId: string) => {
  try {
    const response = await openai.files.content(fileId);
    const fileContent = await response.text();
    console.log(fileContent);
    
    // Create a Blob with the file content
    const blob = new Blob([fileContent], { type: 'application/json' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    return { url, fileName: `${fileId}.json` };
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};
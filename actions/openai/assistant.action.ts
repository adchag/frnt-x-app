'use server';

import OpenAI from "openai";
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

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
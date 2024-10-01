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
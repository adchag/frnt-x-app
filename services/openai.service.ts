'use server';

import OpenAI from 'openai';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getSupabase = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};

export async function createAssistant(name: string, description: string, instructions: string, model: string = 'gpt-4') {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();


  try {
    const assistant = await openai.beta.assistants.create({
      name,
      description,
      instructions,
      model,
    });

    const { data, error } = await supabase
      .from('assistants')
      .insert({
        user_id: user?.id || '36433eda-af40-4562-813f-ad88d0d84af5',
        assistant_id: assistant.id,
        name: assistant.name,
        description: assistant.description,
        model: assistant.model,
        instructions: assistant.instructions,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
}

export async function listAssistants() {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('assistants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error listing assistants:', error);
    throw error;
  }
}

export async function deleteAssistant(assistantId: string) {
  const supabase = getSupabase();

  try {
    await openai.beta.assistants.del(assistantId);

    const { error } = await supabase
      .from('assistants')
      .delete()
      .eq('assistant_id', assistantId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting assistant:', error);
    throw error;
  }
}

export async function getAssistant(assistantId: string) {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('assistants')
      .select('*')
      .eq('assistant_id', assistantId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching assistant:', error);
    throw error;
  }
}

export async function updateAssistant(assistantId: string, updatedData: any) {
  const supabase = getSupabase();

  try {
    // Remove 'id', 'user_id', and 'assistant_id' from updatedData
    const { id, user_id, assistant_id, created_at, updated_at, ...assistantUpdateData } = updatedData;

    const assistant = await openai.beta.assistants.update(
      assistantId,
      assistantUpdateData
    );

    const { error } = await supabase
      .from('assistants')
      .update({
        name: assistant.name,
        description: assistant.description,
        instructions: assistant.instructions,
      })
      .eq('assistant_id', assistantId);

    if (error) throw error;

    return assistant;
  } catch (error) {
    console.error('Error updating assistant:', error);
    throw error;
  }
}

export async function sendMessage(assistantId: string, message: string) {
  try {
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // Poll for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(m => m.role === 'assistant');

    return assistantMessage?.content[0].text.value || 'No response from assistant.';
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

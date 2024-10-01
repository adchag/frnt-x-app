'use server';

import OpenAI from "openai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Assistant-related functions

export interface Assistant {
  instructions?: string;
  name?: string;
  model: string | OpenAI.ChatModel;
  file_ids?: string[];
}

export const create_assistant = async ({ instructions, name, model }: Assistant) => {
  const assistant = await openai.beta.assistants.create({
    instructions,
    name,
    model,
    tools: [
      { type: "code_interpreter" },
      { type: "file_search" },
    ],
  });
  return { assistantId: assistant.id };
};

export const list_assistants = async () => {
  const assistants = await openai.beta.assistants.list();
  return assistants.data.map(assistant => ({
    id: assistant.id,
    name: assistant.name,
    model: assistant.model,
    instructions: assistant.instructions,
    createdAt: assistant.created_at,
  }));
};

export const updateAssistant = async (assistantId: string, updates: Partial<Assistant>) => {
  const updatedAssistant = await openai.beta.assistants.update(assistantId, updates);
  return updatedAssistant;
};

export const sendMessage = async (assistantId: string, content: string) => {
  const thread = await openai.beta.threads.create();
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(thread.id, {
    assistant_id: assistantId,
  });

  return stream.toReadableStream();
};

export const create_thread = async () => {
  const thread = await openai.beta.threads.create();
  return { threadId: thread.id };
};

export const send_message_to_thread = async (threadId: string, assistantId: string, content: string) => {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  return stream.toReadableStream();
};

export const submit_tool_outputs = async (threadId: string, runId: string, toolCallOutputs: any[]) => {
  const stream = openai.beta.threads.runs.submitToolOutputsStream(
    threadId,
    runId,
    { tool_outputs: toolCallOutputs }
  );

  return stream.toReadableStream();
};

// File-related functions

export const upload_file_to_assistant = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const supabase = createRouteHandlerClient({ cookies });

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(`file-${Date.now()}.pdf`, file);

  if (error) {
    throw new Error(error.message);
  }

  return { data };
};

export const get_file_content = async (fileId: string) => {
  const [file, fileContent] = await Promise.all([
    openai.files.retrieve(fileId),
    openai.files.content(fileId),
  ]);

  return { file, fileContent: fileContent.body };
};

// Vector store functions

export const get_or_create_vector_store = async (assistantId: string) => {
  const assistant = await openai.beta.assistants.retrieve(assistantId);

  if (assistant?.tool_resources?.file_search?.vector_store_ids?.length) {
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }

  const vectorStore = await openai.beta.vectorStores.create({
    name: "sample-assistant-vector-store",
  });

  await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });

  return vectorStore.id;
};

export const upload_file_to_vector_store = async (assistantId: string, file: File) => {
  const vectorStoreId = await get_or_create_vector_store(assistantId);

  const openaiFile = await openai.files.create({
    file,
    purpose: "assistants",
  });

  await openai.beta.vectorStores.files.create(vectorStoreId, {
    file_id: openaiFile.id,
  });

  return openaiFile;
};

export const list_files_in_vector_store = async (assistantId: string) => {
  const vectorStoreId = await get_or_create_vector_store(assistantId);
  const fileList = await openai.beta.vectorStores.files.list(vectorStoreId);

  const filesArray = await Promise.all(
    fileList.data.map(async (file) => {
      const fileDetails = await openai.files.retrieve(file.id);
      const vectorFileDetails = await openai.beta.vectorStores.files.retrieve(
        vectorStoreId,
        file.id
      );
      return {
        file_id: file.id,
        filename: fileDetails.filename,
        status: vectorFileDetails.status,
      };
    })
  );

  return filesArray;
};

export const delete_file_from_vector_store = async (assistantId: string, fileId: string) => {
  const vectorStoreId = await get_or_create_vector_store(assistantId);
  await openai.beta.vectorStores.files.del(vectorStoreId, fileId);
};

export const list_models = async () => {
  const models = await openai.models.list();
  return models.data.map(model => ({
    id: model.id,
    name: model.id,
  }));
};
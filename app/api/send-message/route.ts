import { openai } from "@/app/openai";
import { NextResponse } from 'next/server';

export const runtime = "nodejs";

// Send a new message to a thread
export async function POST(request: Request) {
  try {
    const { content, thread_id, assistant_id } = await request.json();

    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: content,
    });

    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: assistant_id,
    });

    return NextResponse.json({ run_id: run.id });
  } catch (error) {
    console.error('Error in send-message route:', error);
    return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
  }
}

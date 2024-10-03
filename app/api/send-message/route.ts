
import { openai } from "@/app/openai";

export const runtime = "nodejs";

// Send a new message to a thread
export async function POST(request: Request) {
  const { content,thread_id,assistant_id } = await request.json();

  await openai.beta.threads.messages.create(thread_id, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(thread_id, {
    assistant_id
  });

  return new Response(stream.toReadableStream());
}

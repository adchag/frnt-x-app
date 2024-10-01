'use client';

import { useRouter } from 'next/navigation';
import useAssistantThreads from "@/hooks/openai/use-assistant-threads";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { EditAssistantCard } from '@/components/edit-assistant-card';

const AssistantThreadsPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { threads, assistant, isLoading, error, refetch, addThread } = useAssistantThreads(params.id);

  if (isLoading) return <div>Loading threads...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Threads for {assistant?.name || 'Assistant'}
        </h1>
        <div>
          <Button onClick={addThread} className="mr-2">
            New Thread
          </Button>
          <Button onClick={() => router.push('/dashboard/assistants')}>
            Back to Assistants
          </Button>
        </div>
      </div>
      
      <EditAssistantCard assistant={assistant} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {threads.map((thread) => (
          <Card key={thread.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/dashboard/assistants/${params.id}/thread/${thread.id}`)}>
            <CardHeader>
              <CardTitle>Thread {thread.id.slice(-4)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Created: {formatDistanceToNow(new Date(thread.created_at * 1000))} ago</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {threads.length === 0 && (
        <p className="text-center mt-4">No threads found for this assistant.</p>
      )}
    </div>
  );
};

export default AssistantThreadsPage;
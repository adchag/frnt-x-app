'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { listAssistants, deleteAssistant } from '@/services/openai.service';
import Link from 'next/link';

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const assistantsData = await listAssistants();
      setAssistants(assistantsData);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assistants',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAssistant = async (assistantId: string) => {
    try {
      await deleteAssistant(assistantId);
      fetchAssistants();
      toast({
        title: 'Success',
        description: 'Assistant deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting assistant:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete assistant',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Assistants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-center items-center p-6">
          <Link href="/dashboard/assistant/create">
            <Button variant="outline" size="lg">
              Create New Assistant
            </Button>
          </Link>
        </Card>
        {assistants.map((assistant) => (
          <Card key={assistant.id}>
            <CardHeader>
              <CardTitle>{assistant.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{assistant.description}</p>
              <p className="text-sm text-gray-500">Model: {assistant.model}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/dashboard/assistant/chat/${assistant.assistant_id}`}>
                <Button variant="outline">Chat</Button>
              </Link>
              <Link href={`/dashboard/assistant/edit/${assistant.assistant_id}`}>
                <Button variant="outline">Edit</Button>
              </Link>
              <Button
                onClick={() => handleDeleteAssistant(assistant.assistant_id)}
                variant="destructive"
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
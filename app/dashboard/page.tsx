'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { listAssistants, deleteAssistant } from '@/services/openai.service';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [assistants, setAssistants] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchAssistants();
      } else {
        router.push('/auth/login');
      }
    };
    checkUser();
  }, [router, supabase.auth]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <p className="mb-4">You are logged in as: {user.email}</p>
      <Button onClick={handleSignOut} className="mb-8">Sign Out</Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-center items-center p-6">
          <Link href="/assistant/create">
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
              <Link href={`/assistant/chat/${assistant.assistant_id}`}>
                <Button variant="outline">Chat</Button>
              </Link>
              <Link href={`/assistant/edit/${assistant.assistant_id}`}>
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
    </div>
  );
}
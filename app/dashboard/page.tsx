'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createAssistant, listAssistants, deleteAssistant } from '@/services/openai.service';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [newAssistant, setNewAssistant] = useState({ name: '', description: '', instructions: '' });
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

  const handleCreateAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssistant(newAssistant.name, newAssistant.description, newAssistant.instructions);
      setNewAssistant({ name: '', description: '', instructions: '' });
      fetchAssistants();
      toast({
        title: 'Success',
        description: 'Assistant created successfully',
      });
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast({
        title: 'Error',
        description: 'Failed to create assistant',
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAssistant} className="space-y-4">
            <Input
              placeholder="Assistant Name"
              value={newAssistant.name}
              onChange={(e) => setNewAssistant({ ...newAssistant, name: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={newAssistant.description}
              onChange={(e) => setNewAssistant({ ...newAssistant, description: e.target.value })}
            />
            <Textarea
              placeholder="Instructions"
              value={newAssistant.instructions}
              onChange={(e) => setNewAssistant({ ...newAssistant, instructions: e.target.value })}
              required
            />
            <Button type="submit">Create Assistant</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Assistants</CardTitle>
        </CardHeader>
        <CardContent>
          {assistants.map((assistant) => (
            <div key={assistant.id} className="mb-4 p-4 border rounded">
              <h3 className="text-xl font-semibold">{assistant.name}</h3>
              <p>{assistant.description}</p>
              <p className="text-sm text-gray-500">Model: {assistant.model}</p>
              <Button
                onClick={() => handleDeleteAssistant(assistant.assistant_id)}
                variant="destructive"
                size="sm"
                className="mt-2"
              >
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
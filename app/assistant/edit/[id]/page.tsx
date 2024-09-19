'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getAssistant, updateAssistant } from '@/services/openai.service';

export default function EditAssistant({ params }: { params: { id: string } }) {
  const [assistant, setAssistant] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssistant = async () => {
      try {
        const data = await getAssistant(params.id);
        setAssistant(data);
      } catch (error) {
        console.error('Error fetching assistant:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch assistant details',
          variant: 'destructive',
        });
      }
    };
    fetchAssistant();
  }, [params.id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, user_id, assistant_id, created_at, updated_at, ...updateData } = assistant;
      await updateAssistant(assistant_id, updateData);
      toast({
        title: 'Success',
        description: 'Assistant updated successfully',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assistant',
        variant: 'destructive',
      });
    }
  };

  if (!assistant) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Assistant Name"
              value={assistant.name}
              onChange={(e) => setAssistant({ ...assistant, name: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={assistant.description}
              onChange={(e) => setAssistant({ ...assistant, description: e.target.value })}
            />
            <Textarea
              placeholder="Instructions"
              value={assistant.instructions}
              onChange={(e) => setAssistant({ ...assistant, instructions: e.target.value })}
              required
            />
            <Button type="submit">Update Assistant</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
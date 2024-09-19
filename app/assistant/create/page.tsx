'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createAssistant } from '@/services/openai.service';

export default function CreateAssistant() {
  const [newAssistant, setNewAssistant] = useState({ name: '', description: '', instructions: '' });
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssistant(newAssistant.name, newAssistant.description, newAssistant.instructions);
      toast({
        title: 'Success',
        description: 'Assistant created successfully',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast({
        title: 'Error',
        description: 'Failed to create assistant',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
    </div>
  );
}
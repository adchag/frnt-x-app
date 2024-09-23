'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getAssistant, sendMessage } from '@/services/openai.service';

export default function ChatWithAssistant({ params }: { params: { id: string } }) {
  const [assistant, setAssistant] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    setInput('');

    try {
      const response = await sendMessage(params.id, input);
      setMessages([...messages, newMessage, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  if (!assistant) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Chat with {assistant.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            {messages.map((message, index) => (
              <div key={index} className={`p-2 rounded ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <p><strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
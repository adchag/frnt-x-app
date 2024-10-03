import { useState, useEffect, useCallback } from 'react';
import { get_messages } from '@/actions/openai/assistant.action';
import OpenAI from 'openai';

interface MessageContent {
  type: string;
  text?: {
    value: string;
    annotations: any[];
  };
}

interface Message {
  role: string;
  content: MessageContent[];
}

const useAssistantThread = (threadId: string, assistantId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const fetchedMessages = await get_messages(threadId);
        setMessages(fetchedMessages.reverse());
      } catch (err) {
        setError('Failed to fetch messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [threadId]);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const userMessage: Message = {
        role: 'user',
        content: [{ type: 'text', text: { value: content, annotations: [] } }],
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      const response = await fetch(`/api/assistants/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, assistantId }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: any = {
        role: 'assistant',
        content: [{ type: 'text', text: { value: '', annotations: [] } }],
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0].delta.content) {
              assistantMessage.content[0].text.value += data.choices[0].delta.content;
              setMessages(prevMessages => [...prevMessages.slice(0, -1), assistantMessage]);
            }
          }
        }
      }

    } catch (err) {
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [threadId, assistantId]);

  return { messages, isLoading, error, sendMessage };
};

export default useAssistantThread;
import { useState, useEffect } from 'react';
import { send_message_to_thread, get_messages } from '@/actions/openai/assistant.action';

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
        setMessages(fetchedMessages.reverse()); // Reverse the order of messages
      } catch (err) {
        setError('Failed to fetch messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [threadId]);

  const sendMessage = async (content: string): Promise<Message> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await send_message_to_thread(threadId, assistantId, content);
      
      // Assuming response is already the correct Message type
      setMessages(prevMessages => [...prevMessages, response]);
      return response;
    } catch (err) {
      setError('Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage };
};

export default useAssistantThread;
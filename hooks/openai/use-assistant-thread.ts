import { useState, useEffect, useCallback } from 'react';
import { get_thread, create_message, run_assistant, get_messages, check_run_status } from '@/actions/openai/assistant.action';

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

  const fetchMessages = useCallback(async () => {
    try {
      const fetchedMessages = await get_messages(threadId);
      setMessages(fetchedMessages.reverse());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (content: string) => {
    try {
      await create_message(threadId, content);
      const run = await run_assistant(threadId, assistantId);
      
      // Poll for run completion
      const checkRunCompletion = async () => {
        const runStatus = await check_run_status(threadId, run.id);
        if (runStatus.status === 'completed') {
          await fetchMessages();
        } else if (runStatus.status === 'failed') {
          setError('Assistant run failed');
        } else {
          setTimeout(checkRunCompletion, 1000); // Check again after 1 second
        }
      };

      checkRunCompletion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return { messages, isLoading, error, sendMessage };
};

export default useAssistantThread;
import { useState, useEffect } from 'react';
import { list_assistant_threads, get_assistant, create_thread } from '@/actions/openai/assistant.action';

interface Thread {
  id: string;
  created_at: number;
  metadata: Record<string, any>;
  assistant_id: string;
}

interface Assistant {
  id: string;
  name: string;
}

const useAssistantThreads = (assistantId: string) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [threadsData, assistantData] = await Promise.all([
          list_assistant_threads(assistantId),
          get_assistant(assistantId)
        ]);
        setThreads(threadsData);
        setAssistant(assistantData as Assistant);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assistantId]);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const data = await list_assistant_threads(assistantId);
      setThreads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addThread = async () => {
    try {
      const newThread = await create_thread(assistantId);
      setThreads(prevThreads => [newThread, ...prevThreads]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    }
  };

  return { threads, assistant, isLoading, error, refetch, addThread };
};

export default useAssistantThreads;
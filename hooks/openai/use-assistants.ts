import { useState, useEffect } from 'react';
import { list_assistants } from '@/actions/openai/assistant.action';

interface Assistant {
  id: string;
  name: string;
  // Add other properties as needed
}

const useAssistants = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        setIsLoading(true);
        const data = await list_assistants();
        setAssistants(data as Assistant[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const data = await list_assistants();
      setAssistants(data as Assistant[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { assistants, isLoading, error, refetch };
};

export default useAssistants;

import { useState, useEffect } from 'react';
import { listAssistants } from '@/services/openai.service';

export const useAssistants = () => {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAssistants = async () => {
      setIsLoading(true);
      try {
        const data = await listAssistants();
        setAssistants(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  return { assistants, isLoading, error };
};
import { useState, useEffect } from 'react';
import { list_vectors } from '@/actions/openai/assistant.action';
import { Vector } from '@/types/openai/vector.type';

const useVectors = () => {
  const [vectors, setVectors] = useState<Vector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVectors = async () => {
      try {
        setIsLoading(true);
        const data = await list_vectors();
        setVectors(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVectors();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const data = await list_vectors();
      setVectors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { vectors, isLoading, error, refetch };
};

export default useVectors;
import { useState, useEffect } from 'react';
import { get_assistant, update_assistant } from '@/actions/openai/assistant.action';

export const useAssistant = (assistantId: string) => {
  const [assistant, setAssistant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistant = async () => {
      setIsLoading(true);
      try {
        const data = await get_assistant(assistantId);
        setAssistant(data);
      } catch (err) {
        setError('Error fetching assistant');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistant();
  }, [assistantId]);

  const updateAssistant = async (data: any) => {
    try {
      const updatedAssistant = await update_assistant(assistantId, data);
      setAssistant(updatedAssistant);
    } catch (err) {
      setError('Error updating assistant');
      throw err;
    }
  };

  return { assistant, isLoading, error, updateAssistant };
};

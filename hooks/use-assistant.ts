import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { create_assistant, list_assistants, updateAssistant,Assistant, sendMessage, list_models } from '@/services/oa.service';

export const useAssistant = (merchantId: string, merchantName: string, merchantDescription: string) => {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const assistantForm = useForm<Partial<Assistant>>();

  useEffect(() => {
    const fetchAssistants = async () => {
      setIsLoadingAssistants(true);
      try {
        const data = await list_assistants();
        setAssistants(data);
      } catch (err) {
        console.error('Error fetching assistants:', err);
      } finally {
        setIsLoadingAssistants(false);
      }
    };

    const fetchModels = async () => {
      try {
        const data = await list_models();
        setModels(data);
      } catch (err) {
        console.error('Error fetching models:', err);
      }
    };

    fetchAssistants();
    fetchModels();
  }, []);

  const handleAssistantChange = async (assistantId: string) => {
    setSelectedAssistant(assistantId);
    // Update merchant's assistant ID in the database
  };

  const handleCreateAssistant = async () => {
    const newAssistant = await create_assistant({
      name: `${merchantName} Assistant`,
      instructions: `You are an assistant for ${merchantName}. ${merchantDescription || ''}`,
      model: selectedModel
    });

    setSelectedAssistant(newAssistant.assistantId);
    // Update merchant's assistant ID in the database
  };

  const handleAssistantFormSubmit = async (data: Partial<Assistant>) => {
    if (!selectedAssistant) return;

    try {
      await updateAssistant(selectedAssistant, {
        name: data.name,
        instructions: data.instructions,
        model: data.model,
      });
      toast.success('Assistant updated successfully');
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast.error('Failed to update assistant');
    }
  };

  return {
    assistants,
    isLoadingAssistants,
    selectedAssistant,
    models,
    selectedModel,
    setSelectedModel,
    assistantForm,
    handleAssistantChange,
    handleCreateAssistant,
    handleAssistantFormSubmit,
  };
};
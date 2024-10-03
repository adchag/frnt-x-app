'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { update_assistant, get_assistant } from '@/actions/openai/assistant.action';
import PageLoader from '@/components/page-loader';
import { toast } from 'sonner';
import useVectors from "@/hooks/openai/use-vectors";
import { VectorSelect } from '@/components/vector-select';
import { VectorFileList } from '@/components/vector-file-list';

const EditAssistantPage = () => {
  const params = useParams();
  const router = useRouter();
  const assistantId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm();
  const { vectors, isLoading: isVectorsLoading, error: vectorsError, refetch: refetchVectors } = useVectors();
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistant = async () => {
      try {
        const assistant = await get_assistant(assistantId);
        
        const useJsonMode = assistant.response_format !== 'auto' && assistant.response_format?.type === 'json_object';
        setValue('name', assistant.name);
        setValue('description', assistant.description);
        setValue('instructions', assistant.instructions);
        setValue('model', assistant.model);
        setValue('temperature', assistant.temperature || 0.7);
        setValue('useJsonMode', useJsonMode);

        // Set the initial selected vector if the assistant has one
        if (assistant.tool_resources?.file_search?.vector_store_ids?.length) {
          setSelectedVectorId(assistant.tool_resources?.file_search?.vector_store_ids?.[0] || null);
        }
      } catch (error) {
        console.error('Error fetching assistant:', error);
        toast.error('Failed to load assistant details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssistant();
  }, [assistantId, setValue]);

  const onSubmit = async (data: any) => {
    setIsUpdating(true);
    try {
      const updateData = {
        ...data,
        response_format: data.useJsonMode ? { type: 'json_object' } : null,
        tool_resources: selectedVectorId ? {
          file_search: {
            vector_store_ids: [selectedVectorId],
          },
        } : undefined,
      };
      await update_assistant(assistantId, updateData);
      toast.success('Assistant updated successfully');
      router.push(`/dashboard/assistants/${assistantId}`);
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast.error('Failed to update assistant');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVectorUpdate = () => {
    refetchVectors();
  };

  if (isLoading || isVectorsLoading) return <PageLoader />;
  if (vectorsError) return <div>Error loading vectors: {vectorsError}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Assistant</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} />
        </div>
        <div>
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea id="instructions" {...register('instructions')} />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Select onValueChange={(value) => setValue('model', value)} defaultValue={watch('model')}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="temperature">Temperature: {watch('temperature')}</Label>
          <Slider
            id="temperature"
            min={0}
            max={2}
            step={0.1}
            value={[watch('temperature')]}
            onValueChange={(value) => setValue('temperature', value[0])}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="useJsonMode"
            checked={watch('useJsonMode')}
            onCheckedChange={(checked) => setValue('useJsonMode', checked)}
          />
          <Label htmlFor="useJsonMode">Use JSON Mode</Label>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vector Store</h2>
          <VectorSelect
            vectors={vectors}
            selectedVectorId={selectedVectorId}
            onSelectVector={setSelectedVectorId}
            assistantId={assistantId}
            onVectorUpdate={handleVectorUpdate}
          />
          {selectedVectorId && (
            <VectorFileList vectorId={selectedVectorId} />
          )}
        </div>

        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Assistant'}
        </Button>
      </form>
    </div>
  );
};

export default EditAssistantPage;
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import PageLoader from '@/components/page-loader';
import { toast } from 'sonner';
import useVectors from "@/hooks/openai/use-vectors";
import { VectorSelect } from '@/components/vector-select';
import { VectorFileList } from '@/components/vector-file-list';
import { useAssistant } from '@/hooks/openai/use-assistant';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';

const EditAssistantPage = () => {
  const params = useParams();
  const router = useRouter();
  const assistantId = params.id as string;
  const { assistant, isLoading, error, updateAssistant } = useAssistant(assistantId);
  const form = useForm();
  const { vectors, isLoading: isVectorsLoading, error: vectorsError, refetch: refetchVectors } = useVectors();

  useEffect(() => {
    if (assistant) {
      const useJsonMode = assistant.response_format !== 'auto' && assistant.response_format?.type === 'json_object';
      form.reset({
        name: assistant.name,
        description: assistant.description,
        instructions: assistant.instructions,
        model: assistant.model,
        temperature: assistant.temperature || 0.7,
        useJsonMode: useJsonMode,
        selectedVectorId: assistant.tool_resources?.file_search?.vector_store_ids?.[0] || null,
      });
    }
  }, [assistant, form]);

  const onSubmit = async (data: any) => {
    try {
      const updateData = {
        ...data,
        response_format: data.useJsonMode ? { type: 'json_object' } : null,
        tool_resources: data.selectedVectorId ? {
          file_search: {
            vector_store_ids: [data.selectedVectorId],
          },
        } : undefined,
      };
      await updateAssistant(updateData);
      toast.success('Assistant updated successfully');
      router.push(`/dashboard/assistants/${assistantId}`);
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast.error('Failed to update assistant');
    }
  };

  const handleVectorUpdate = () => {
    refetchVectors();
  };

  if (error) {
    return <div>Error loading assistant: {error}</div>;
  }

  return (
    <PageLoader isLoading={isLoading || isVectorsLoading}>
      {vectorsError ? (
        <div>Error loading vectors: {vectorsError}</div>
      ) : (
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Edit Assistant</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="useJsonMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Use JSON Mode</FormLabel>
                      <FormDescription>
                        Enable JSON output format for the assistant
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Vector Store</h2>
                <FormField
                  control={form.control}
                  name="selectedVectorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <VectorSelect
                          vectors={vectors}
                          selectedVectorId={field.value}
                          onSelectVector={field.onChange}
                          assistantId={assistantId}
                          onVectorUpdate={handleVectorUpdate}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('selectedVectorId') && (
                  <VectorFileList vectorId={form.watch('selectedVectorId')} />
                )}
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Updating...' : 'Update Assistant'}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </PageLoader>
  );
};

export default EditAssistantPage;
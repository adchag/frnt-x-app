import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { update_assistant } from '@/actions/openai/assistant.action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface EditAssistantCardProps {
  assistant: any;
  onUpdate: () => Promise<void>;
}

export const EditAssistantCard: React.FC<EditAssistantCardProps> = ({ assistant, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: assistant?.name || '',
      description: assistant?.description || '',
      instructions: assistant?.instructions || '',
      model: assistant?.model || '',
      temperature: assistant?.temperature || 0.7,
      useJsonMode: assistant?.response_format?.type === 'json_object' || false,
    },
  });

  const onSubmit = async (data: any) => {
    setIsUpdating(true);
    try { 
      const updateData = {
        ...data,
        response_format: data.useJsonMode ? { type: 'json_object' } : null,
      };
      await update_assistant(assistant.id, updateData);
      toast.success('Assistant updated successfully');
      setIsEditing(false);
      await onUpdate();
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast.error('Failed to update assistant');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
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
              <Select onValueChange={(value) => setValue('model', value)} defaultValue={assistant?.model}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
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
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Assistant'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p><strong>Name:</strong> {assistant?.name}</p>
            <p><strong>Description:</strong> {assistant?.description}</p>
            <p><strong>Instructions:</strong> {assistant?.instructions}</p>
            <p><strong>Model:</strong> {assistant?.model}</p>
            <p><strong>Temperature:</strong> {assistant?.temperature}</p>
            <p><strong>JSON Mode:</strong> {assistant?.response_format?.type === 'json_object' ? 'Enabled' : 'Disabled'}</p>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateAssistant } from '@/actions/openai/assistant.action';
import { toast } from 'sonner';

interface EditAssistantCardProps {
  assistant: any;
}

export const EditAssistantCard: React.FC<EditAssistantCardProps> = ({ assistant }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: assistant?.name || '',
      instructions: assistant?.instructions || '',
    },
  });

  const onSubmit = async (data: { name: string; instructions: string }) => {
    try {
      await updateAssistant(assistant.id, data);
      toast.success('Assistant updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update assistant');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <Input id="name" {...register('name')} />
              </div>
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                <Textarea id="instructions" {...register('instructions')} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  reset();
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </div>
          </form>
        ) : (
          <div>
            <p><strong>Name:</strong> {assistant?.name}</p>
            <p><strong>Instructions:</strong> {assistant?.instructions}</p>
            <Button onClick={() => setIsEditing(true)} className="mt-4">Edit</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
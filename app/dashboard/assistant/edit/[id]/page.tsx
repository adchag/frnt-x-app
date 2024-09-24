'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { getAssistant, updateAssistant, uploadFileToAssistant } from '@/services/openai.service';

export default function EditAssistant({ params }: { params: { id: string } }) {
  const [assistant, setAssistant] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const fetchAssistant = async () => {
      try {
        const data = await getAssistant(params.id);
        setAssistant(data);
      } catch (error) {
        console.error('Error fetching assistant:', error);
        toast.error('Failed to fetch assistant details');
      }
    };
    fetchAssistant();
  }, [params.id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Upload new files first
      const newFileIds = [];
      for (const file of files) {
        try {
          const fileId = await uploadFileToAssistant(file);
          newFileIds.push(fileId);
        } catch (error:any) {
          console.error(`Error uploading file ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        }
      }
      
      const updateData = {
        name: assistant.name,
        description: assistant.description,
        instructions: assistant.instructions,
        file_ids: [...(assistant.file_ids || []), ...newFileIds],
      };

      await updateAssistant(assistant.assistant_id, updateData);
      toast.success('Assistant updated successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast.error('Failed to update assistant: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => file.size <= 20 * 1024 * 1024);
      
      if (validFiles.length !== selectedFiles.length) {
        toast.warning('Some files were not added because they exceed the 20MB size limit.');
      }
      
      setFiles(validFiles);
    }
  };

  if (!assistant) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Assistant Name"
              value={assistant.name}
              onChange={(e) => setAssistant({ ...assistant, name: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={assistant.description}
              onChange={(e) => setAssistant({ ...assistant, description: e.target.value })}
            />
            <Textarea
              placeholder="Instructions"
              value={assistant.instructions}
              onChange={(e) => setAssistant({ ...assistant, instructions: e.target.value })}
              required
            />
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              multiple
            />
            {assistant.file_ids && assistant.file_ids.length > 0 && (
              <div>
                <p>Current files:</p>
                <ul>
                  {assistant.file_ids.map((fileId: string, index: number) => (
                    <li key={index}>{fileId}</li>
                  ))}
                </ul>
              </div>
            )}
            {files.length > 0 && (
              <div>
                <p>New files to upload:</p>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Assistant'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
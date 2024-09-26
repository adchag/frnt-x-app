'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useMerchant } from '@/hooks/use-merchant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/file-uploader';
import PageLoader from '@/components/page-loader';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner"
import { debounce } from 'lodash';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addMerchantFile, deleteMerchantFile, getMerchant,updateMerchantFiles } from '@/services/merchant.service';
import { useAssistants } from '@/hooks/use-assistants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAssistant, updateAssistant, sendMessage } from '@/services/openai.service';
import Link from 'next/link';

interface FormData {
  company_name: string;
  logo: any;
  description: string;
  files: any[];
}

type Database = any;

const EditMerchantPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { merchant, merchantFiles, isLoading, error } = useMerchant(id as string);
  const { assistants, isLoading: isLoadingAssistants } = useAssistants();
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);

  const form = useForm<FormData>();

  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  useEffect(() => {
    if (merchant) {
      const initialData = {
        company_name: merchant.company_name,
        description: merchant.description || '',
        logo: merchant.logo,
      };
      setOriginalData(initialData as any);
      Object.entries(initialData).forEach(([key, value]) => {
        form.setValue(key as keyof FormData, value);
      });
    }
  }, [merchant, form]);

  useEffect(() => {
    if (merchant && merchant.assistant_id) {
      setSelectedAssistant(merchant.assistant_id);
    }
  }, [merchant]);

  const updateField = useCallback(async (field: string, value: any) => {
    if (JSON.stringify(originalData?.[field as keyof FormData]) === JSON.stringify(value)) {
      return; // No change, don't update
    }

    setIsUpdating(true);
    if (id) {
      const { error } = await supabase
        .from('merchants')
        .update({ [field]: value })
        .eq('id', id);

      if (error) {
        console.error(`Error updating ${field}:`, error);
        toast.error(`Error updating ${field}`);
      } else {
        toast.success(`${field} updated successfully`);
        // Update the original data
        setOriginalData(prev => prev ? { ...prev, [field]: value } : null);
      }
    }
    setIsUpdating(false);
  }, [id, supabase, originalData]);

  const debouncedUpdateField = useCallback(debounce(updateField, 500), [updateField]);

  const handleFileUpload = async (file: File) => {
    if (!id) return;

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('merchants')
      .upload(`${id}/files/${fileName}`, file);

    if (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('merchants')
      .getPublicUrl(`${id}/files/${fileName}`);

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      url: publicUrlData.publicUrl,
      merchant_id: id,
    };
  };

  const handleAssistantChange = async (assistantId: string) => {
    setSelectedAssistant(assistantId);
    await updateField('assistant_id', assistantId);
  };

  const handleCreateAssistant = async () => {
    if (!merchant) return;

    const newAssistant = await createAssistant(
      `${merchant.company_name} Assistant`,
      `Assistant for ${merchant.company_name}`,
      `You are an assistant for ${merchant.company_name}. ${merchant.description || ''}`
    );

    setSelectedAssistant(newAssistant.id);
    await updateField('assistant_id', newAssistant.id);
  };

  const handleSyncFiles = async () => {
    if (!selectedAssistant || !merchantFiles) return;

    const filesToSync = merchantFiles.map(file => ({
      filename: file.name,
      content: file.url,
    }));

    await updateAssistant(selectedAssistant, {
      name: merchant?.company_name || '',
      description: merchant?.description || '',
      instructions: `You are an assistant for ${merchant?.company_name}. ${merchant?.description || ''}`,
      file_ids: filesToSync.map(file => file.filename),
    });

    for (const file of filesToSync) {
      await sendMessage(selectedAssistant, `Please process and understand the content of this file: ${file.content}`);
    }

    toast.success('Files synchronized with assistant');
  };

  if (isLoading) return <PageLoader />;
  if (error) return <div>Error: {error.message}</div>;
  if (!merchant) return <div>Merchant not found</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/merchants')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Merchants
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-6">Edit Merchant Mandate</h1>
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onBlur={() => debouncedUpdateField('company_name', field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <FileUploader
                    bucketName="merchants"
                    folderPath={`${id}/logos`}
                    value={field.value}
                    onChange={(files) => {
                      const file = Array.isArray(files) ? files[0] : files;
                      field.onChange(file);
                      debouncedUpdateField('logo', file);
                    }}
                    multiple={false}
                    acceptedFileTypes={['image/*']}
                  />
                </FormControl>
                <FormMessage />
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
                  <Textarea
                    {...field}
                    rows={4}
                    onBlur={() => debouncedUpdateField('description', field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="files"
            render={() => (
              <FormItem>
                <FormLabel>Additional Files</FormLabel>
                <FormControl>
                  <FileUploader
                    bucketName="merchants"
                    folderPath={`${id}/files`}
                    value={merchantFiles}
                    onChange={async (files) => {
                      console.debug('files', files);
                      const updatedFiles = files?.map((file: any) => ({
                        id: file.id,
                        file: { path: file.file.path },
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: file.url,
                        progress: file.progress,
                        merchant_id: id as string,
                      }));
                      await updateMerchantFiles(id as string, updatedFiles);
                    }}
                    multiple={true}
                    acceptedFileTypes={['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                  />
                </FormControl>
                <FormDescription>
                  Upload additional files related to the merchant (images, PDFs, Word documents)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">OpenAI Assistant</h2>
        {isLoadingAssistants ? (
          <p>Loading assistants...</p>
        ) : (
          <>
            <Select value={selectedAssistant || ''} onValueChange={handleAssistantChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an assistant" />
              </SelectTrigger>
              <SelectContent>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 space-x-4">
              <Button onClick={handleCreateAssistant} disabled={!!selectedAssistant}>
                Create New Assistant
              </Button>
              <Button onClick={handleSyncFiles} disabled={!selectedAssistant}>
                Sync Files with Assistant
              </Button>
              {selectedAssistant && (
                <Link href={`/dashboard/assistant/edit/${selectedAssistant}`}>
                  <Button variant="outline">Edit Assistant</Button>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
      {isUpdating && <p className="text-blue-500 mt-4">Updating...</p>}
    </div>
  );
};

export default EditMerchantPage;

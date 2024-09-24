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

interface FormData {
  company_name: string;
  logo: any;
  description: string;
}

type Database = any;

const EditMerchantMandatePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { merchant, isLoading, error } = useMerchant(id as string);

  const form = useForm<FormData>();

  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  useEffect(() => {
    if (merchant) {
      const initialData = {
        company_name: merchant.company_name,
        description: merchant.description || '',
        logo: merchant.logo ? {
          id: merchant.logo.id || `${Date.now()}-${merchant.logo.name}`,
          name: merchant.logo.name,
          type: merchant.logo.type || 'image/png',
          size: merchant.logo.size,
          path: merchant.logo.path || `${id}/${merchant.logo.id || merchant.logo.name}`,
          url: merchant.logo.url || '',
        } : null,
      };
      setOriginalData(initialData);
      Object.entries(initialData).forEach(([key, value]) => {
        form.setValue(key as keyof FormData, value);
      });
    }
  }, [merchant, id]);

  const updateField = useCallback(async (field: string, value: any) => {
    if (JSON.stringify(originalData?.[field as keyof FormData]) === JSON.stringify(value)) {
      return; // No change, don't update
    }

    setIsUpdating(true);
    if (id) {
      const { error } = await supabase
        .from('merchant_mandates')
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
                    bucketName="merchant-logos"
                    folderPath={`${id}`}
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
        </form>
      </Form>
      {isUpdating && <p className="text-blue-500 mt-4">Updating...</p>}
    </div>
  );
};

export default EditMerchantMandatePage;

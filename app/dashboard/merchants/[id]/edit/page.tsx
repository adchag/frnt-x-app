'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMerchant } from '@/app/hooks/use-merchant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/file-uploader';
import PageLoader from '@/components/page-loader';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner"
import { debounce } from 'lodash';

interface FormData {
  company_name: string;
  logo: any;
  description: string;
}

const EditMerchantMandatePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { merchant, isLoading, error } = useMerchant(id as string);

  const { control, setValue, watch } = useForm<FormData>();

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
        setValue(key as keyof FormData, value);
      });
    }
  }, [merchant, id, setValue]);

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
      <div className="space-y-4">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <Controller
            name="company_name"
            control={control}
            rules={{ required: 'Company name is required' }}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input 
                  {...field} 
                  onBlur={() => debouncedUpdateField('company_name', field.value)}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
            Logo
          </label>
          <Controller
            name="logo"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FileUploader
                bucketName="merchant-logos"
                folderPath={`${id}`}
                value={value}
                onChange={(files) => {
                  const file = Array.isArray(files) ? files[0] : files;
                  onChange(file);
                  debouncedUpdateField('logo', file);
                }}
                multiple={false}
                acceptedFileTypes={['image/*']}
              />
            )}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea 
                {...field} 
                rows={4} 
                onBlur={() => debouncedUpdateField('description', field.value)}
              />
            )}
          />
        </div>
      </div>
      {isUpdating && <p className="text-blue-500 mt-4">Updating...</p>}
    </div>
  );
};

export default EditMerchantMandatePage;

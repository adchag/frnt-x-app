'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMerchant } from '@/app/hooks/use-merchant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/file-uploader';
import PageLoader from '@/components/page-loader';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft } from 'lucide-react'; // Import Lucide icon
import { toast } from "sonner"


type Database = any;

const EditMerchantMandatePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { merchant, isLoading, error } = useMerchant(id as string);

  const [formData, setFormData] = useState({
    company_name: '',
    logo: null as any,
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (merchant) {
      setFormData({
        company_name: merchant.company_name,
        logo: merchant.logo ? {
          id: merchant.logo.id || `${Date.now()}-${merchant.logo.name}`,
          name: merchant.logo.name,
          type: merchant.logo.type || 'image/png', // Assume PNG if not specified
          size: merchant.logo.size,
          path: merchant.logo.path || `${id}/${merchant.logo.id || merchant.logo.name}`,
          url: merchant.logo.url || '',
        } : null,
        description: merchant.description || '',
      });
    }
  }, [merchant, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (id) {
      const { error } = await supabase
        .from('merchant_mandates')
        .update({
          company_name: formData.company_name,
          description: formData.description,
          logo: formData.logo ? {
            id: formData.logo.id,
            name: formData.logo.name,
            type: formData.logo.type,
            size: formData.logo.size,
            path: formData.logo.path,
          } : null,
        })
        .eq('id', id);

      console.log('Error updating merchant mandate:', error);
      if (error) {
        console.error('Error updating merchant mandate:', error);
        toast.error(
          'Error updating merchant mandate'
        );
      } else {
        toast.success(
          'Merchant mandate updated successfully'
        );
      }
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <PageLoader />;
  if (error) return <div>Error: {error.message}</div>;
  if (!merchant) return <div>Merchant not found</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard/merchants')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Merchants
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-6">Edit Merchant Mandate</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <Input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
            Logo
          </label>
          <FileUploader
            bucketName="merchant-logos"
            folderPath={`${id}`}
            value={formData.logo}
            onChange={(files) => {
              const file = Array.isArray(files) ? files[0] : files;
              setFormData((prev) => ({ ...prev, logo: file }));
            }}
            multiple={false}
            acceptedFileTypes={['image/*']}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <Button type="submit" isLoading={isSubmitting}>Update Mandate</Button>
      </form>
    </div>
  );
};

export default EditMerchantMandatePage;

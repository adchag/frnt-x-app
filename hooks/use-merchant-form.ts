import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { debounce } from 'lodash';
import { toast } from "sonner";
import { Database } from '@/types/supabase';

interface FormData {
  company_name: string;
  logo: any;
  description: string;
}

export const useMerchantForm = (id: string, initialData: FormData | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const form = useForm<FormData>();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (initialData) {
      setOriginalData(initialData);
      Object.entries(initialData).forEach(([key, value]) => {
        form.setValue(key as keyof FormData, value);
      });
    }
  }, [initialData, form]);

  const updateField = useCallback(async (field: string, value: any) => {
    if (JSON.stringify(originalData?.[field as keyof FormData]) === JSON.stringify(value)) {
      return;
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
        setOriginalData(prev => prev ? { ...prev, [field]: value } : null);
      }
    }
    setIsUpdating(false);
  }, [id, supabase, originalData]);

  const debouncedUpdateField = useCallback(debounce(updateField, 500), [updateField]);

  return { form, isUpdating, debouncedUpdateField };
};
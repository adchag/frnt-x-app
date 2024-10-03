"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import { useMerchant } from "@/hooks/use-merchant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/file-uploader";
import PageLoader from "@/components/page-loader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { debounce } from "lodash";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { addMerchantFile, deleteMerchantFile, getMerchant, updateMerchantFiles } from "@/services/merchant.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { create_assistant, list_assistants, updateAssistant, sendMessage, list_models } from "@/services/oa.service";

interface FormData {
  company_name: string;
  logo: any;
  description: string;
  files: any[];
}

interface AssistantFormData {
  name: string;
  instructions: string;
  model: string;
}

type Database = any;

interface FormProps extends UseFormReturn<FormData> {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

const CustomForm: React.FC<FormProps> = ({ children, className, onSubmit, ...formMethods }) => (
  <FormProvider {...formMethods}>
    <form className={className} onSubmit={onSubmit}>
      {children}
    </form>
  </FormProvider>
);

const EditMerchantPage = () => {
  const { id } = useParams() as any;
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { merchant, merchantFiles, isLoading, error } = useMerchant(id as string);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [assistantData, setAssistantData] = useState<AssistantFormData | null>(null);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");

  const form = useForm<FormData>();
  const assistantForm = useForm<AssistantFormData>();

  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  useEffect(() => {
    if (merchant) {
      const initialData = {
        company_name: merchant.company_name,
        description: merchant.description || "",
        logo: merchant.logo,
      };
      setOriginalData(initialData as any);
      Object.entries(initialData).forEach(([key, value]) => {
        form.setValue(key as keyof FormData, value);
      });
    }
  }, [merchant, form]);

  useEffect(() => {
    if (merchant && merchant.oa_assistant_id) {
      setSelectedAssistant(merchant.oa_assistant_id);
    }
  }, [merchant]);

  useEffect(() => {
    const fetchAssistants = async () => {
      setIsLoadingAssistants(true);
      try {
        const data = await list_assistants();
        setAssistants(data);
      } catch (err) {
        console.error("Error fetching assistants:", err);
      } finally {
        setIsLoadingAssistants(false);
      }
    };

    fetchAssistants();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await list_models();
        setModels(data);
      } catch (err) {
        console.error("Error fetching models:", err);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    if (selectedAssistant) {
      const assistant = assistants.find((a) => a.id === selectedAssistant);
      console.debug("assistant", assistant);
      if (assistant) {
        setAssistantData({
          name: assistant.name,
          instructions: assistant.instructions,
          model: assistant.model,
        });
        assistantForm.setValue("name", assistant.name);
        assistantForm.setValue("instructions", assistant.instructions);
        assistantForm.setValue("model", assistant.model);
        setSelectedModel(assistant.model);
      }
    }
  }, [selectedAssistant, assistants, assistantForm]);

  const updateField = useCallback(
    async (field: string, value: any) => {
      if (JSON.stringify(originalData?.[field as keyof FormData]) === JSON.stringify(value)) {
        return; // No change, don't update
      }

      setIsUpdating(true);
      if (id) {
        const { error } = await supabase
          .from("merchants")
          .update({ [field]: value })
          .eq("id", id);

        if (error) {
          console.error(`Error updating ${field}:`, error);
          toast.error(`Error updating ${field}`);
        } else {
          toast.success(`${field} updated successfully`);
          // Update the original data
          setOriginalData((prev) => (prev ? { ...prev, [field]: value } : null));
        }
      }
      setIsUpdating(false);
    },
    [id, supabase, originalData]
  );

  const debouncedUpdateField = useCallback(debounce(updateField, 500), [updateField]);

  const handleAssistantChange = async (assistantId: string) => {
    setSelectedAssistant(assistantId);
    await updateField("oa_assistant_id", assistantId);
  };

  const handleAssistantFormSubmit = async (data: AssistantFormData) => {
    if (!selectedAssistant) return;

    setIsUpdating(true);
    try {
      await updateAssistant(selectedAssistant, {
        name: data.name,
        instructions: data.instructions,
        model: data.model,
      });
      toast.success("Assistant updated successfully");
    } catch (error) {
      console.error("Error updating assistant:", error);
      toast.error("Failed to update assistant");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageLoader isLoading={isLoading}>
      {error ? (
        <div>Error: {error.message}</div>
      ) : !merchant ? (
        <div>Merchant not found</div>
      ) : (
        <div className="container mx-auto py-10">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/merchants")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Merchants
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-6">Edit Merchant Mandate</h1>
          <CustomForm {...form} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} onBlur={() => debouncedUpdateField("company_name", field.value)} />
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
                        debouncedUpdateField("logo", file);
                      }}
                      multiple={false}
                      acceptedFileTypes={["image/*"]}
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
                    <Textarea {...field} rows={4} onBlur={() => debouncedUpdateField("description", field.value)} />
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
                      acceptedFileTypes={[
                        "image/*",
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ]}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload additional files related to the merchant (images, PDFs, Word documents)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CustomForm>
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">OpenAI Assistant</h2>
            {isLoadingAssistants ? (
              <p>Loading assistants...</p>
            ) : (
              <>
                <Select value={selectedAssistant || ""} onValueChange={handleAssistantChange}>
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
                {selectedAssistant && assistantData && (
                  <CustomForm
                    {...(assistantForm as any)}
                    onSubmit={assistantForm.handleSubmit(handleAssistantFormSubmit) as any}
                    className="space-y-4 mt-4"
                  >
                    <FormField
                      control={assistantForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assistant Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assistantForm.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assistantForm.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedModel(value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                              <SelectContent>
                                {models.map((model) => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" isLoading={isUpdating}>
                      {isUpdating ? "Updating..." : "Update Assistant"}
                    </Button>
                  </CustomForm>
                )}
              </>
            )}
          </div>
          {isUpdating && <p className="text-blue-500 mt-4">Updating...</p>}
        </div>
      )}
    </PageLoader>
  );
};

export default EditMerchantPage;

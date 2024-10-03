import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from '@/components/file-uploader';

export const MerchantForm = ({ form, debouncedUpdateField, id }: any) => (
  <div className="space-y-4">
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
  </div>
);
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AssistantFormProps {
  assistantForm: any;
  models: any;
  selectedModel: any;
  setSelectedModel: any;
  handleAssistantFormSubmit: any;
  isUpdating: any;
}

export const AssistantForm = ({ assistantForm, models, selectedModel, setSelectedModel, handleAssistantFormSubmit, isUpdating }: AssistantFormProps) => (
  <form onSubmit={assistantForm.handleSubmit(handleAssistantFormSubmit)} className="space-y-4 mt-4">
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
            <Select value={field.value} onValueChange={(value) => {
              field.onChange(value);
              setSelectedModel(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model: any) => (
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
      {isUpdating ? 'Updating...' : 'Update Assistant'}
    </Button>
  </form>
);
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vector } from "@/types/openai/vector.type";
import { attach_vector, update_vector } from "@/actions/openai/assistant.action";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VectorSelectProps {
  vectors: Vector[];
  selectedVectorId: string | null;
  onSelectVector: (vectorId: string) => void;
  assistantId: string;
  onVectorUpdate: () => void;
}

export const VectorSelect = ({ vectors, selectedVectorId, onSelectVector, assistantId, onVectorUpdate }: VectorSelectProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const handleSelectVector = async (vectorId: string) => {
    setIsUpdating(true);
    try {
      await attach_vector(assistantId, [vectorId]);
      onSelectVector(vectorId);
    } catch (error) {
      console.error("Error attaching vector to assistant:", error);
      toast.error("Failed to attach vector to assistant");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = () => {
    const selectedVector = vectors.find(v => v.id === selectedVectorId);
    if (selectedVector) {
      setEditName(selectedVector.name);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedVectorId) {
      setIsUpdating(true);
      try {
        await update_vector(selectedVectorId, editName);
        toast.success("Vector store name updated successfully");
        onVectorUpdate();
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating vector store name:", error);
        toast.error("Failed to update vector store name");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={selectedVectorId || undefined}
        onValueChange={handleSelectVector}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a vector store" />
        </SelectTrigger>
        <SelectContent>
          {vectors.map((vector) => (
            <SelectItem key={vector.id} value={vector.id}>
              {vector.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedVectorId && !isEditing && (
        <Button onClick={handleEditClick} variant="outline" size="sm">
          Edit Name
        </Button>
      )}
      {isEditing && (
        <div className="flex items-center space-x-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="New vector store name"
          />
          <Button onClick={handleSaveEdit} disabled={isUpdating}>
            Save
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
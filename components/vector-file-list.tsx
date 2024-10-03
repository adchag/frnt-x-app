import { useState, useEffect } from 'react';
import { list_vector_files, delete_vector_file, upload_file_to_vector } from '@/actions/openai/assistant.action';
import { VectorFile } from '@/types/openai/vector.type';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VectorFileCard } from './vector-file-card';

interface VectorFileListProps {
  vectorId: string;
}

export const VectorFileList = ({ vectorId }: VectorFileListProps) => {
  const [files, setFiles] = useState<VectorFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [vectorId]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const data = await list_vector_files(vectorId);
      setFiles(data as unknown as VectorFile[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Files', files);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await upload_file_to_vector(vectorId, file);
        fetchFiles();
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await delete_vector_file(vectorId, fileId);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input type="file" onChange={handleFileUpload} />
        <Button onClick={() => document.getElementById('file-upload')?.click()}>
          Upload File
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <VectorFileCard
            key={file.id}
            file={file}
            onDelete={() => handleFileDelete(file.id)}
          />
        ))}
      </div>
    </div>
  );
};
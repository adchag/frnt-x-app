// components/FileUploader.tsx

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase-client';
import {
  Card,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  X,
  Download,
  Trash,
  File as FileIcon,
  Image as ImageIcon,
  Music,
  Video,
  FileText,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const supabase = createClient();

interface FileData {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  path: string;
}

interface FileUploaderProps {
  bucketName: string;
  folderPath: string;
  value?: FileData | FileData[] | null;
  onChange?: (files: FileData | FileData[] | null) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  bucketName,
  folderPath,
  value,
  onChange,
  multiple = true,
  maxFiles,
}) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [deleteFile, setDeleteFile] = useState<FileData | null>(null);

  // Initialize files from value
  useEffect(() => {
    if (value) {
      const initialFiles = Array.isArray(value) ? value : [value];
      setFiles(initialFiles);
    } else {
      setFiles([]);
    }
  }, [value]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (maxFiles && files.length >= maxFiles) {
        toast.error(`Maximum of ${maxFiles} files allowed.`);
        return;
      }

      let filesToAdd = acceptedFiles;

      if (maxFiles) {
        const availableSlots = maxFiles - files.length;
        filesToAdd = acceptedFiles.slice(0, availableSlots);
      }

      for (const file of filesToAdd) {
        const fileId = `${Date.now()}-${file.name}`;
        const filePath = `${folderPath}/${fileId}`;

        // Upload the file to Supabase Storage
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            upsert: true,
          });

        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }

        // Get the public URL of the uploaded file
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const newFile: FileData = {
          id: fileId,
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size,
          path: filePath,
        };

        if (!multiple) {
          // Replace existing files
          setFiles([newFile]);
          if (onChange) {
            onChange(newFile);
          }
        } else {
          const updatedFiles = [...files, newFile];
          setFiles(updatedFiles);
          if (onChange) {
            onChange(updatedFiles);
          }
        }

        toast.success(`${file.name} uploaded successfully.`);
      }
    },
    [bucketName, folderPath, files, onChange, multiple, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    disabled: !multiple && files.length >= 1,
  });

  const handleDelete = async (file: FileData) => {
    // Delete the file from Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([file.path]);

    if (error) {
      toast.error(`Failed to delete ${file.name}: ${error.message}`);
      return;
    }

    // Update the state
    const updatedFiles = files.filter((f) => f.id !== file.id);
    setFiles(updatedFiles);

    // Update parent component
    if (onChange) {
      if (multiple) {
        onChange(updatedFiles);
      } else {
        onChange(null);
      }
    }

    toast.success(`${file.name} deleted successfully.`);
  };

  const renderFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-gray-500" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="w-8 h-8 text-gray-500" />;
    } else if (fileType.startsWith('audio/')) {
      return <Music className="w-8 h-8 text-gray-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-gray-500" />;
    } else {
      return <FileIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const renderFilePreview = (file: FileData) => {
    return (
      <Card key={file.id} className="flex items-center p-4">
        {/* Left: Icon or Image */}
        <div className="flex-shrink-0">
          {file.type.startsWith('image/') && file.url ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            renderFileIcon(file.type)
          )}
        </div>
        {/* Middle: File info */}
        <div className="ml-4 flex-grow">
          <p className="text-sm font-medium">{file.name}</p>
          {file.size && (
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          )}
        </div>
        {/* Right: Actions */}
        <div className="flex-shrink-0 ml-4">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(file.url, '_blank')}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteFile(file)}
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      {(!files.length || (multiple && files.length < (maxFiles || Infinity))) && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 rounded-md cursor-pointer ${
            isDragActive ? 'border-blue-500' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-center">Drop the files here ...</p>
          ) : (
            <p className="text-center">
              Drag &apos;n&apos; drop files here, or click to select files
            </p>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2">
        {files.map((file) => renderFilePreview(file))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteFile?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteFile(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteFile) {
                  handleDelete(deleteFile);
                  setDeleteFile(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

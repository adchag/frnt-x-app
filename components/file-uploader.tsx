// components/FileUploader.tsx

"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/supabase.client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X, Download, Trash, File, Image as ImageIcon, Music, Video, FileText, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";

const supabase = createClient();

interface FileData {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  path?: string;
  isUploading?: boolean;
  isDeleting?: boolean;
  progress?: number;
  [key: string]: any;
}

interface FileUploaderProps {
  bucketName: string;
  folderPath: string;
  value?: FileData | FileData[];
  onChange?: (files: FileData | FileData[] | null) => void;
  multiple?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  onDelete?: (fileId: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  bucketName,
  folderPath,
  value,
  onChange,
  multiple = true,
  maxFiles,
  acceptedFileTypes = ["image/*"],
}) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [deleteFile, setDeleteFile] = useState<FileData | null>(null);
  const filesRef = useRef<FileData[]>([]);

  // Initialize files from value
  useEffect(() => {
    if (value) {
      const initialFiles = Array.isArray(value) ? value : [value];
      // Ensure default properties are set and generate URL if missing
      const initializedFiles = initialFiles.map((file) => ({
        ...file,
        isUploading: false,
        isDeleting: false,
        progress: 100,
        url: file.url || generateFileUrl(bucketName, file.path || `${folderPath}/${file.id}`),
      }));
      setFiles(initializedFiles);
    } else {
      setFiles([]);
    }
  }, [value, bucketName, folderPath]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const generateFileUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (maxFiles && filesRef.current.length >= maxFiles) {
        toast.error(`Maximum of ${maxFiles} files allowed.`);
        return;
      }

      let filesToAdd = acceptedFiles;

      if (maxFiles) {
        const availableSlots = maxFiles - filesRef.current.length;
        filesToAdd = acceptedFiles.slice(0, availableSlots);
      }

      const newFiles = filesToAdd.map((file) => ({
        id: `${Date.now()}-${file.name.replace(/\s/g, "")}`,
        name: file.name,
        url: "",
        type: file.type, // This should correctly set the MIME type
        size: file.size,
        file,
        isUploading: true,
        progress: 0,
      }));

      // Immediately add new files to the state
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      let updatedFiles = [...filesRef.current, ...newFiles];

      for (const fileData of newFiles) {
        // remove space in fileData.id and folderPath
        const filePath = `${folderPath}/${fileData.id.replace(/\s/g, "")}`;

        const { error } = await supabase.storage.from(bucketName).upload(filePath, fileData.file, {
          upsert: true,
        });

        if (error) {
          toast.error(`Failed to upload ${fileData.name}: ${error.message}`);
          setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileData.id));
          continue;
        }

        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        console.log("urlData", urlData);
        console.log("files", updatedFiles);
        // Update the file data after upload
        updatedFiles = updatedFiles.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                url: urlData.publicUrl,
                path: filePath,
                isUploading: false,
                progress: 100,
              }
            : f
        );

        toast.success(`${fileData.name} uploaded successfully.`);
      }
      setFiles(updatedFiles);

      // Update parent component
      if (onChange) {
        onChange(multiple ? updatedFiles : updatedFiles[updatedFiles.length - 1]);
      }
    },
    [bucketName, folderPath, onChange, multiple, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    disabled: !multiple && filesRef.current.length >= 1,
  });

  const handleDelete = async (file: FileData, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    setFiles((prevFiles) => prevFiles.map((f) => (f.id === file.id ? { ...f, isDeleting: true } : f)));

    const filePath = file.path || `${folderPath}/${file.id}`;

    const { error: storageError } = await supabase.storage.from(bucketName).remove([filePath]);

    if (storageError) {
      toast.error(`Failed to delete ${file.name} from storage: ${storageError.message}`);
      setFiles((prevFiles) => prevFiles.map((f) => (f.id === file.id ? { ...f, isDeleting: false } : f)));
      return;
    }

    // Remove the file from the local state
    const updatedFiles = filesRef.current.filter((f) => f.id !== file.id);
    setFiles(updatedFiles);
    toast.success(`${file.name} deleted successfully.`);

    // Update parent component
    if (onChange) {
      onChange(multiple ? updatedFiles : null);
    }
  };

  const renderFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 text-gray-500" />;
    } else if (fileType.startsWith("video/")) {
      return <Video className="w-8 h-8 text-gray-500" />;
    } else if (fileType.startsWith("audio/")) {
      return <Music className="w-8 h-8 text-gray-500" />;
    } else if (fileType === "application/pdf") {
      return <FileText className="w-8 h-8 text-gray-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const renderFilePreview = (file: FileData) => {
    return (
      <Card key={file.id} className="flex items-center p-4">
        {/* Left: Image or Icon */}
        <div className="flex-shrink-0">
          {file.type.startsWith("image/") && file.url ? (
            <div className="relative w-12 h-12">
              <Image src={file.url} alt={file.name} width={48} height={48} className="rounded object-cover" />
            </div>
          ) : (
            renderFileIcon(file.type)
          )}
        </div>
        {/* Middle: File info */}
        <div className="ml-4 flex-grow">
          <p className="text-sm font-medium">{file.name}</p>
          {file.size && <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>}
          {file.isUploading && <Progress value={file.progress} className="mt-2" />}
        </div>
        {/* Right: Actions */}
        <div className="flex-shrink-0 ml-4">
          <div className="flex space-x-2">
            {file.url && !file.isUploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(file.url, "_blank");
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteFile(file);
              }}
              disabled={file.isUploading || file.isDeleting}
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
      {!filesRef.current.length ? (
        <div
          {...getRootProps()}
          className={`border border-dashed p-4 rounded-md cursor-pointer text-sm ${
            isDragActive ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-center">Drop the files here ...</p>
          ) : (
            <p className="text-center text-gray-500 max-w-[180px] m-auto">
              Drag &apos;n&apos; drop files here, or click to select files
            </p>
          )}
        </div>
      ) : null}
      <div className="mt-4 space-y-2">{files.map((file) => renderFilePreview(file))}</div>
      {multiple && filesRef.current.length < (maxFiles || Infinity) && (
        <div className="flex justify-end mt-2">
          <Button
            variant="outline"
            size="xs"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              open();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add more files
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>Are you sure you want to delete {deleteFile?.name}?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteFile(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (deleteFile) {
                  handleDelete(deleteFile, e);
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

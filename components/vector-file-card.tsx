import { VectorFile } from '@/types/openai/vector.type';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileText } from "lucide-react";
import moment from 'moment';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { download_vector_file } from '@/actions/openai/assistant.action';

interface VectorFileCardProps {
  file: VectorFile;
  onDelete: () => void;
}

export const VectorFileCard = ({ file, onDelete }: VectorFileCardProps) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    try {
      const { url, fileName } = await download_vector_file(file.id);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold truncate">{file.id}</h3>
          </div>
          <Badge variant={file?.status === 'completed' ? 'default' : 'outline'}>
            {file?.status}
          </Badge>
        </div>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Vector Store ID:</span> {file?.vector_store_id}</p>
          <p><span className="font-medium">Size:</span> {formatBytes(file?.usage_bytes || 0)}</p>
          <p><span className="font-medium">Created:</span> {moment.unix(file?.created_at || 0).fromNow()}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="font-medium cursor-help">Chunking Strategy:</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Type: {file?.chunking_strategy?.type}</p>
                <p>Max Chunk Size: {file?.chunking_strategy?.static?.max_chunk_size_tokens} tokens</p>
                <p>Chunk Overlap: {file?.chunking_strategy?.static?.chunk_overlap_tokens} tokens</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          type="button"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          type="button"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
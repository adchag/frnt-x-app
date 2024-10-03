import { VectorFile } from '@/types/openai/vector.type';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VectorFileCardProps {
  file: VectorFile;
  onDelete: () => void;
}

export const VectorFileCard = ({ file, onDelete }: VectorFileCardProps) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-semibold">{file.file_id}</h3>
        <p>Status: {file.status}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.open(`https://api.openai.com/v1/files/${file.file_id}/content`, '_blank')}>
          Download
        </Button>
        <Button variant="destructive" onClick={onDelete}>Delete</Button>
      </CardFooter>
    </Card>
  );
};
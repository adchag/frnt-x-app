import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface AssistantDetailsCardProps {
  assistant: any;
}

export const AssistantDetailsCard: React.FC<AssistantDetailsCardProps> = ({ assistant }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{assistant.name}</CardTitle>
        <Link href={`/dashboard/assistants/${assistant.id}/edit`} passHref>
          <Button variant="outline">Edit Assistant</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Description:</strong> {assistant.description}</p>
          <p><strong>Model:</strong> {assistant.model}</p>
          <p><strong>Temperature:</strong> {assistant.temperature}</p>
          <p><strong>JSON Mode:</strong> {assistant.response_format?.type === 'json_object' ? 'Enabled' : 'Disabled'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
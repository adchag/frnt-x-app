'use client';

import Link from 'next/link';
import useAssistants from "@/hooks/openai/use-assistants";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AssistantsPage = () => {
  const { assistants, isLoading, error, refetch } = useAssistants();

  if (isLoading) return <div>Loading assistants...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assistants</h1>
        <Button onClick={refetch}>Refresh Assistants</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assistants.map((assistant) => (
          <Card key={assistant.id}>
            <CardHeader>
              <CardTitle>{assistant.name || "Unnamed Assistant"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/assistants/${assistant.id}`} passHref>
                <Button className="w-full">View Threads</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {assistants.length === 0 && (
        <p className="text-center mt-4">No assistants found.</p>
      )}
    </div>
  );
};

export default AssistantsPage;
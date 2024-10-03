'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAssistant } from '@/hooks/openai/use-assistant';
import { Button } from "@/components/ui/button";
import PageLoader from '@/components/page-loader';

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams();
  const assistantId = params.id as string;
  const { assistant, isLoading, error } = useAssistant(assistantId);

  return (
    <PageLoader isLoading={isLoading}>
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <div>
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h1 className="text-2xl font-bold">{assistant?.name}</h1>
              <p className="text-sm text-gray-500">{assistant?.description}</p>
            </div>
            <Link href={`/dashboard/assistants/${assistantId}/edit`} passHref>
              <Button>Edit Assistant</Button>
            </Link>
          </div>
          <main>{children}</main>
        </div>
      )}
    </PageLoader>
  );
}
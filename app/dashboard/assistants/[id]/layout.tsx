'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useAssistant } from '@/hooks/openai/use-assistant';
import { Button } from "@/components/ui/button";
import PageLoader from '@/components/page-loader';
import { ArrowLeft, Edit } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams();
  const pathname = usePathname();
  const assistantId = params?.id as string;
  const { assistant, isLoading, error } = useAssistant(assistantId);

  const showBackButton = pathname?.includes('/edit') || pathname?.includes('/chat') || (pathname?.split('/').length ?? 0) > 4;

  return (
    <PageLoader isLoading={isLoading}>
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="flex flex-col h-screen">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Link href={`/dashboard/assistants/${assistantId}`} passHref>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-bold">{assistant?.name}</h1>
                <p className="text-sm text-gray-500">{assistant?.description}</p>
              </div>
            </div>
            <Link href={`/dashboard/assistants/${assistantId}/edit`} passHref>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ScrollArea className="flex-grow">
            <main className="h-full">{children}</main>
          </ScrollArea>
        </div>
      )}
    </PageLoader>
  );
}
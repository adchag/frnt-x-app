'use client';

import { useRouter } from 'next/navigation';
import useAssistantThreads from "@/hooks/openai/use-assistant-threads";
import useVectors from "@/hooks/openai/use-vectors";
import { Button } from "@/components/ui/button";
import { MyTable } from "@/components/my-table";
import { columns } from "./columns";
import { AssistantDetailsCard } from '@/components/assistant-details-card';
import PageLoader from '@/components/page-loader';
import { useState } from 'react';

const AssistantPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { threads, assistant, isLoading: isAssistantLoading, error: assistantError, refetch, addThread } = useAssistantThreads(params.id);
  const { vectors, isLoading: isVectorsLoading, error: vectorsError } = useVectors();
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);

  if (isAssistantLoading || isVectorsLoading) return <PageLoader />;
  if (assistantError || vectorsError) return <div>Error: {assistantError || vectorsError}</div>;

  return (
    <div className="space-y-6 p-6">
      <AssistantDetailsCard assistant={assistant} />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Threads</h2>
        <Button onClick={addThread}>New Thread</Button>
      </div>
      
      <MyTable columns={columns} data={threads} />
    </div>
  );
};

export default AssistantPage;
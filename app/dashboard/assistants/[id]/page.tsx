'use client';

import { useRouter } from 'next/navigation';
import useAssistantThreads from "@/hooks/openai/use-assistant-threads";
import useVectors from "@/hooks/openai/use-vectors";
import { Button } from "@/components/ui/button";
import { MyTable } from "@/components/my-table";
import { columns } from "./columns";
import { AssistantDetailsCard } from '@/components/assistant-details-card';
import PageLoader from '@/components/page-loader';

const AssistantPage = ({ params }: { params: { id: string } }) => {
  const { threads, assistant, isLoading: isAssistantLoading, error: assistantError, refetch, addThread } = useAssistantThreads(params.id);

  return (
    <PageLoader isLoading={isAssistantLoading}>
      <div className="space-y-6 p-6">
          <AssistantDetailsCard assistant={assistant} />
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Threads</h2>
            <Button onClick={addThread}>New Thread</Button>
          </div>
          
          <MyTable columns={columns} data={threads} />
        </div>
    </PageLoader>
  );
};

export default AssistantPage;
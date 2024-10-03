'use client';

import { useRouter } from 'next/navigation';
import useAssistantThreads from "@/hooks/openai/use-assistant-threads";
import { Button } from "@/components/ui/button";
import { MyTable } from "@/components/my-table";
import { columns } from "./columns";
import { AssistantDetailsCard } from '@/components/assistant-details-card';
import PageLoader from '@/components/page-loader';

const AssistantPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { threads, assistant, isLoading, error, refetch, addThread } = useAssistantThreads(params.id);

  if (isLoading) return <PageLoader />;
  if (error) return <div>Error: {error}</div>;

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
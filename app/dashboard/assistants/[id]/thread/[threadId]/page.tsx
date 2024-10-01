'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import useAssistantThread from '@/hooks/openai/use-assistant-thread';
import { ChatUI } from '@/components/chat-ui';
import PageLoader from '@/components/page-loader';

const ThreadPage = () => {
  const router = useRouter();
  const params = useParams();
  const assistantId = params.id as string;
  const threadId = params.threadId as string;
  
  const { messages, isLoading, error, sendMessage } = useAssistantThread(threadId, assistantId);

  if (isLoading) return <PageLoader />;
  if (error) return <div>Error: {error}</div>;

  const handleBack = () => {
    router.push(`/dashboard/assistants/${assistantId}`);
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatUI messages={messages} onSendMessage={sendMessage} onBack={handleBack} />
    </div>
  );
};

export default ThreadPage;
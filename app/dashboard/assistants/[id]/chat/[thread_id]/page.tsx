'use client';

import { useParams } from 'next/navigation';
import useAssistantThread from '@/hooks/openai/use-assistant-thread';
import { ChatUI } from '@/components/chat-ui';
import PageLoader from '@/components/page-loader';

const ChatPage = () => {
  const params = useParams();
  const assistantId = params.id as string;
  const threadId = params.thread_id as string;
  
  const { messages, isLoading, error, sendMessage } = useAssistantThread(threadId, assistantId);

  if (isLoading && messages.length === 0) return <PageLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatUI initialMessages={messages} onSendMessage={sendMessage} onBack={() => {}} />
    </div>
  );
};

export default ChatPage;
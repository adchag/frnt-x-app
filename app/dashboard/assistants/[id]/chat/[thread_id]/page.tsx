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

  return (
    <PageLoader isLoading={isLoading && messages.length === 0}>
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="h-[calc(100vh-85px)]">
          <ChatUI initialMessages={messages} onSendMessage={sendMessage} onBack={() => {}} />
        </div>
      )}
    </PageLoader>
  );
};

export default ChatPage;
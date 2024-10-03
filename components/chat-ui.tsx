import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface MessageContent {
  type: string;
  text?: {
    value: string;
    annotations: any[];
  };
}

interface Message {
  role: string;
  content: MessageContent[];
  isLoading?: boolean;
}

interface ChatUIProps {
  initialMessages: Message[];
  onSendMessage: (content: string) => Promise<Message>;
  onBack: () => void;
}

const renderMessageContent = (content: MessageContent[]) => {
  return content.map((item, index) => {
    if (item.type === 'text' && item.text) {
      return <p key={index}>{item.text.value}</p>;
    }
    return null;
  });
};

export const ChatUI: React.FC<ChatUIProps> = ({ initialMessages, onSendMessage, onBack }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: Message = {
        role: 'user',
        content: [{ type: 'text', text: { value: inputMessage, annotations: [] } }]
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Add a loading message for the assistant
      const loadingMessage: Message = {
        role: 'assistant',
        content: [],
        isLoading: true
      };
      setMessages(prevMessages => [...prevMessages, loadingMessage]);

      setInputMessage('');

      try {
        const assistantResponse = await onSendMessage(inputMessage);
        
        // Replace the loading message with the actual response
        setMessages(prevMessages => 
          prevMessages.map((msg, index) => 
            index === prevMessages.length - 1 ? assistantResponse : msg
          )
        );
      } catch (error) {
        console.error('Error sending message:', error);
        // Handle error (e.g., show an error message to the user)
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <Button onClick={onBack}>Back to Assistant</Button>
        <h2 className="text-xl font-bold">Chat Thread</h2>
      </div>
      <ScrollArea className="flex-grow p-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              <Avatar className="w-8 h-8">
                <AvatarFallback>{message.role === 'user' ? 'U' : 'A'}</AvatarFallback>
              </Avatar>
              <div className={`mx-2 p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {message.isLoading ? (
                  <>
                    <Skeleton className="h-4 w-[200px] mb-2" />
                    <Skeleton className="h-4 w-[150px]" />
                  </>
                ) : (
                  renderMessageContent(message.content)
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
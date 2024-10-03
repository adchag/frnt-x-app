import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setIsLoading(true);
      
      const userMessage: Message = {
        role: 'user',
        content: [{ type: 'text', text: { value: inputMessage, annotations: [] } }]
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      const loadingMessage: Message = {
        role: 'assistant',
        content: [],
        isLoading: true
      };
      setMessages(prevMessages => [...prevMessages, loadingMessage]);

      setInputMessage('');

      try {
        const assistantResponse = await onSendMessage(inputMessage);
        
        setMessages(prevMessages => 
          prevMessages.slice(0, -1).concat(assistantResponse)
        );
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prevMessages => prevMessages.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
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
          <div ref={messagesEndRef} />
        </div>
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
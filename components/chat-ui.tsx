import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
}

interface ChatUIProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack: () => void;
}

const renderMessageContent = (content: MessageContent[]) => {
  return content.map((item, index) => {
    if (item.type === 'text' && item.text) {
      return <p key={index}>{item.text.value}</p>;
    }
    // Add more conditions here for other content types if needed
    return null;
  });
};

export const ChatUI: React.FC<ChatUIProps> = ({ messages, onSendMessage, onBack }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
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
                {renderMessageContent(message.content)}
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
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
};
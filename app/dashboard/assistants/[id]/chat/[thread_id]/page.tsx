'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useParams } from 'next/navigation';
import useAssistantThread from '@/hooks/openai/use-assistant-thread';
import PageLoader from '@/components/page-loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AssistantStream } from 'openai/lib/AssistantStream';
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from 'openai/resources/beta/assistants/assistants';
import { RequiredActionFunctionToolCall } from 'openai/resources/beta/threads/runs/runs';
import { ArrowUp, Paperclip, Bot, Copy } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'code';
  content: string;
}

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-1 text-xs font-sans rounded-t-md">
        <span>{language}</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={copyToClipboard}
        >
          {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        className="rounded-b-md !m-0"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const ChatPage = () => {
  const params = useParams();
  const assistantId = params?.id as string;
  const threadId = params?.thread_id as string;
  
  const { messages: initialMessages, isLoading, error } = useAssistantThread(threadId, assistantId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  const scrollToBottom = () => {
    if (scrollAreaRef.current && shouldScrollRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          const { scrollTop, scrollHeight, clientHeight } = scrollElement;
          shouldScrollRef.current = scrollTop + clientHeight >= scrollHeight - 10;
        }
      }
    };

    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages.map((message: any) => ({
        role: message.role,
        content: message.content?.[0]?.text?.value || ''
      })));
    }
  }, [initialMessages]);

  const sendMessage = async (text: string) => {
    const response = await fetch(
      `/api/send-message`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
          thread_id: threadId,
          assistant_id: assistantId,
        }),
      }
    );
    if (response.body) {
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    }
  };

  const appendMessage = (role: 'user' | 'assistant' | 'code', content: string) => {
    setMessages(prevMessages => [...prevMessages, { role, content }]);
  };

  const appendToLastMessage = (content: string) => {
    setMessages(prevMessages => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        content: lastMessage.content + content,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };


  const annotateLastMessage = (annotations: any[]) => {
    setMessages((prevMessages: any[]) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation: any) => {
        if (annotation.type === 'file_path') {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      })
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  }

  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  const handleTextDelta = (delta: { value?: string; annotations?: any[] }) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  const handleImageFileDone = (image: { file_id: string }) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  };

  const toolCallCreated = (toolCall: { type: string }) => {
    if (toolCall.type !== "code_interpreter") return;
    appendMessage("code", "");
  };

  const toolCallDelta = (delta: { type: string; code_interpreter?: { input?: string } }, snapshot: any) => {
    if (delta.type !== "code_interpreter") return;
    if (!delta.code_interpreter?.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // Implement function call handler logic here
  };

  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);
    stream.on("imageFileDone", handleImageFileDone);
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);
    stream.on("event", (event: any) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    const messageContent = userInput; // Store the message content
    setUserInput(''); // Clear the input immediately
    appendMessage('user', messageContent);
    setInputDisabled(true);
    await sendMessage(messageContent);
  };

  return (
    <PageLoader isLoading={isLoading && messages.length === 0}>
      {error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="h-[calc(100vh-85px)] flex flex-col">
          <ScrollArea className="flex-grow p-4 scroll-smooth" ref={scrollAreaRef}>
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-gray-200 text-gray-800' 
                    : ' text-gray-800 flex items-start'
                }`}>
                  {message.role === 'assistant' && (
                    <Bot className="mr-2 h-10 w-10 text-gray-600 flex-shrink-0 bg-gray-100 p-2 rounded-full" />
                  )}
                  <div className="prose max-w-none">
                    <Markdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, '')}
                              {...props}
                            />
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </Markdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && <div className="text-center">Loading...</div>}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-4 ">
            <div className="flex items-center bg-gray-100 rounded-lg p-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                className="mr-2"
                onClick={() => {/* Implement file upload later */}}
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </Button>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-grow bg-transparent focus:outline-none"
                placeholder="Type your message..."
                disabled={inputDisabled}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon"
                disabled={isLoading || inputDisabled || !userInput.trim()}
                className="ml-2"
              >
                <ArrowUp className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </PageLoader>
  );
};

export default ChatPage;
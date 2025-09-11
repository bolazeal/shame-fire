'use client';

import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import type { Conversation, Message } from '@/lib/types';
import {
  ArrowLeft,
  Loader2,
  Send,
  MessageCircle,
} from 'lucide-react';
import { MessageBubble } from './message-bubble';
import { Skeleton } from '../ui/skeleton';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  isLoadingMessages: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onBack: () => void; // For mobile view
}

export function ChatWindow({
  conversation,
  messages,
  isLoadingMessages,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const { user: currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = conversation?.participants.find(
    (p) => p.id !== currentUser?.uid
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;
    
    setIsSending(true);
    await onSendMessage(newMessage);
    setNewMessage('');
    setIsSending(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e as any);
    }
  };


  if (!conversation) {
    return (
      <div className="hidden h-full flex-col items-center justify-center bg-muted/30 p-4 text-center lg:flex">
        <MessageCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold font-headline">Your Messages</h2>
        <p className="text-muted-foreground">
          Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <header className="flex h-14 flex-shrink-0 items-center gap-4 border-b border-border bg-background px-4 shadow-sm">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
          <ArrowLeft />
        </Button>
        {otherParticipant && (
          <>
            <UserAvatar user={otherParticipant} className="h-10 w-10" />
            <div>
              <p className="font-bold">{otherParticipant.name}</p>
              <p className="text-sm text-muted-foreground">@{otherParticipant.username}</p>
            </div>
          </>
        )}
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
            {isLoadingMessages ? (
                <>
                    <Skeleton className="h-12 w-2/3 self-start rounded-lg" />
                    <Skeleton className="h-16 w-1/2 self-end rounded-lg" />
                    <Skeleton className="h-8 w-1/3 self-start rounded-lg" />
                </>
            ) : (
                messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={message.senderId === currentUser?.uid}
                    />
                ))
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0 border-t border-border bg-background p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <TextareaAutosize
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            autoComplete="off"
            disabled={isSending}
            minRows={1}
            maxRows={6}
            className="flex-1 resize-none self-center rounded-2xl border border-input bg-muted/50 px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending} className="h-10 w-10 shrink-0 rounded-full">
            {isSending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </div>
    </div>
  );
}

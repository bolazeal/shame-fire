'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import type { Conversation, Message } from '@/lib/types';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
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

  if (!conversation) {
    return (
      <div className="hidden h-full flex-col items-center justify-center p-4 text-center md:flex">
        <Send className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Your Messages</h2>
        <p className="text-muted-foreground">
          Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b p-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>
        {otherParticipant && (
          <>
            <UserAvatar user={otherParticipant} className="h-10 w-10" />
            <div>
              <p className="font-bold">{otherParticipant.name}</p>
              <p className="text-sm text-muted-foreground">
                @{otherParticipant.username}
              </p>
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
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
            {isSending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

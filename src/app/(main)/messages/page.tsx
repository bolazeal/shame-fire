'use client';

import { useState, useEffect } from 'react';
import type { Conversation, Message } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { listenToConversations, listenToMessages } from '@/lib/firestore';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatWindow } from '@/components/messages/chat-window';
import { cn } from '@/lib/utils';
import { sendMessageAction } from '@/lib/actions/message';
import { useSearchParams } from 'next/navigation';

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Set initial state based on query param for both mobile and desktop
  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (!user) {
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    const unsubscribe = listenToConversations(user.uid, (convos) => {
      setConversations(convos);
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const unsubscribe = listenToMessages(selectedConversationId, (msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConversationId]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleSendMessage = async (
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ) => {
    if (!selectedConversationId || !user) return;
    await sendMessageAction(
      selectedConversationId,
      user.uid,
      text,
      mediaUrl,
      mediaType
    );
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  return (
    <div className="h-screen overflow-hidden">
      <main className="flex h-full">
        <div
          className={cn(
            'h-full w-full flex-shrink-0 border-r md:w-80 lg:w-96',
            selectedConversationId && 'hidden md:flex md:flex-col'
          )}
        >
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            isLoading={loadingConversations}
          />
        </div>
        <div
          className={cn(
            'h-full flex-1',
            !selectedConversationId && 'hidden md:flex'
          )}
        >
          <ChatWindow
            conversation={selectedConversation || null}
            messages={messages}
            isLoadingMessages={loadingMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedConversationId(null)}
          />
        </div>
      </main>
    </div>
  );
}

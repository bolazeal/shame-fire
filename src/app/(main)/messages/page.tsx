
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { getConversations, getMessages } from '@/lib/firestore';
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
  >(initialConversationId);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // For mobile view
  const [showChat, setShowChat] = useState(!!initialConversationId);

  useEffect(() => {
    // If an initial conversation ID is passed, select it.
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
      setShowChat(true);
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (!user) {
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    const unsubscribe = getConversations(user.uid, (convos) => {
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
    const unsubscribe = getMessages(selectedConversationId, (msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConversationId]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowChat(true); // Switch to chat view on mobile
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
      <main className="grid h-full grid-cols-1 md:grid-cols-3 xl:grid-cols-4">
        <div
          className={cn('col-span-1 h-full', showChat && 'hidden md:block')}
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
            'col-span-1 h-full md:col-span-2 xl:col-span-3',
            !showChat && 'hidden md:block'
          )}
        >
          <ChatWindow
            conversation={selectedConversation || null}
            messages={messages}
            isLoadingMessages={loadingMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setShowChat(false)}
          />
        </div>
      </main>
    </div>
  );
}

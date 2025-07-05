'use client';

import { useState, useEffect } from 'react';
import type { Conversation, Message } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import {
  getConversations,
  getMessages,
  sendMessage,
} from '@/lib/firestore';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatWindow } from '@/components/messages/chat-window';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // For mobile view
  const [showChat, setShowChat] = useState(false);

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

  const handleSendMessage = async (text: string) => {
    if (!selectedConversationId || !user) return;
    await sendMessage(selectedConversationId, user.uid, text);
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  return (
    <div className="h-[calc(100vh-65px)] overflow-hidden lg:h-full">
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Loader2 } from 'lucide-react';
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
import { isFirebaseConfigured } from '@/lib/firebase';
import { mockConversations, mockMessages } from '@/lib/mock-data';

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
    if (!user) return;

    let unsubscribe: () => void;
    if (isFirebaseConfigured) {
      unsubscribe = getConversations(user.uid, (convos) => {
        setConversations(convos);
        setLoadingConversations(false);
      });
    } else {
      // Mock mode
      setTimeout(() => {
        setConversations(mockConversations);
        setLoadingConversations(false);
      }, 500);
      unsubscribe = () => {};
    }

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    let unsubscribe: () => void;
    if (isFirebaseConfigured) {
        unsubscribe = getMessages(selectedConversationId, (msgs) => {
            setMessages(msgs);
            setLoadingMessages(false);
        });
    } else {
        // Mock mode
        setTimeout(() => {
            setMessages(mockMessages[selectedConversationId] || []);
            setLoadingMessages(false);
        }, 300);
        unsubscribe = () => {};
    }


    return () => unsubscribe();
  }, [selectedConversationId]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowChat(true); // Switch to chat view on mobile
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedConversationId || !user) return;

    if(isFirebaseConfigured) {
        await sendMessage(selectedConversationId, user.uid, text);
    } else {
        // Mock mode
        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            senderId: user.uid,
            text,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
    }

  };
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="h-[calc(100vh-65px)] overflow-hidden lg:h-full">
      <main className="grid h-full grid-cols-1 md:grid-cols-3 xl:grid-cols-4">
        <div
          className={cn(
            'col-span-1 h-full',
            showChat && 'hidden md:block'
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

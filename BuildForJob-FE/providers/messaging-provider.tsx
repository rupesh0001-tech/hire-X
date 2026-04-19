"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/store/hooks';
import { MessageModel, InboxConversation, ChatUser, messageApi } from '@/apis/message.api';

interface MessagingContextType {
  socket: Socket | null;
  isWidgetOpen: boolean;
  setWidgetOpen: (open: boolean) => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
  inbox: InboxConversation[];
  activeChatHistory: MessageModel[];
  sendMessage: (content: string, contextType?: string, contextId?: string) => void;
  unreadTotal: number;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export const useMessaging = () => {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error("useMessaging must be used within MessagingProvider");
  return ctx;
};

export const MessagingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppSelector(s => s.auth);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isWidgetOpen, setWidgetOpen] = useState(false);
  const [activeChatUser, setActiveChatUserState] = useState<ChatUser | null>(null);
  
  const [inbox, setInbox] = useState<InboxConversation[]>([]);
  const [activeChatHistory, setActiveChatHistory] = useState<MessageModel[]>([]);

  // Ref to always have latest active target when receiving WS event
  const activeChatRef = useRef<ChatUser | null>(null);

  const setActiveChatUser = (u: ChatUser | null) => {
    setActiveChatUserState(u);
    activeChatRef.current = u;
    if (u) {
      setWidgetOpen(true);
      fetchChatHistory(u.id);
      
      // clear unread locally
      setInbox(prev => prev.map(c => c.otherUser.id === u.id ? { ...c, unreadCount: 0 } : c));
    }
  };

  const fetchInbox = async () => {
    try {
      const res = await messageApi.getInbox();
      if (res.success) setInbox(res.data);
    } catch (e) {}
  };

  const fetchChatHistory = async (userId: string) => {
    try {
      const res = await messageApi.getChatHistory(userId);
      if (res.success) setActiveChatHistory(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    if (!user) return;

    fetchInbox();

    const token = localStorage.getItem('token');
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('receiveMessage', (msg: MessageModel) => {
      // If we are currently chatting with the sender
      if (activeChatRef.current?.id === msg.senderId) {
        setActiveChatHistory(prev => [...prev, msg]);
      } else {
        // Just Update Inbox Unread
        fetchInbox(); 
      }
    });

    newSocket.on('messageSent', (msg: MessageModel) => {
      setActiveChatHistory(prev => [...prev, msg]);
      fetchInbox(); // Update latest message in inbox
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Expose sending function
  const sendMessage = (content: string, contextType?: string, contextId?: string) => {
    if (!socket || !activeChatRef.current) return;
    socket.emit('sendMessage', {
      receiverId: activeChatRef.current.id,
      content,
      contextType,
      contextId
    });
  };

  const unreadTotal = inbox.reduce((acc, curr) => acc + curr.unreadCount, 0);

  return (
    <MessagingContext.Provider value={{
      socket,
      isWidgetOpen,
      setWidgetOpen,
      activeChatUser,
      setActiveChatUser,
      inbox,
      activeChatHistory,
      sendMessage,
      unreadTotal
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

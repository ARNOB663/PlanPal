import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Message, Conversation } from '../types';
import { mockMessages, mockConversations } from '../data/mockData';
import { format } from 'date-fns';

interface MessageContextType {
  messages: Message[];
  conversations: Conversation[];
  getConversationMessages: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];
  sendMessage: (senderId: string, receiverId: string, content: string) => void;
  markAsRead: (messageId: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);

  const getConversationMessages = (conversationId: string): Message[] => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return [];
    
    const [user1, user2] = conversation.participants;
    return messages.filter(m => 
      (m.senderId === user1 && m.receiverId === user2) || 
      (m.senderId === user2 && m.receiverId === user1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getUserConversations = (userId: string): Conversation[] => {
    return conversations.filter(c => c.participants.includes(userId));
  };

  const sendMessage = (senderId: string, receiverId: string, content: string) => {
    const now = new Date();
    const timestamp = format(now, 'yyyy-MM-dd HH:mm:ss');
    
    // Create new message
    const newMessage: Message = {
      id: `msg${messages.length + 1}`,
      senderId,
      receiverId,
      content,
      timestamp,
      read: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update or create conversation
    const conversationExists = conversations.some(c => 
      c.participants.includes(senderId) && c.participants.includes(receiverId)
    );
    
    if (conversationExists) {
      setConversations(prev => prev.map(c => {
        if (c.participants.includes(senderId) && c.participants.includes(receiverId)) {
          return {
            ...c,
            lastMessage: content,
            lastMessageTime: timestamp,
            unreadCount: c.participants[0] === receiverId ? c.unreadCount + 1 : c.unreadCount
          };
        }
        return c;
      }));
    } else {
      const newConversation: Conversation = {
        id: `conv${conversations.length + 1}`,
        participants: [senderId, receiverId],
        lastMessage: content,
        lastMessageTime: timestamp,
        unreadCount: 1
      };
      setConversations(prev => [...prev, newConversation]);
    }
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, read: true } : m
    ));
    
    // Update unread count in conversation
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setConversations(prev => prev.map(c => {
        if (c.participants.includes(message.senderId) && c.participants.includes(message.receiverId)) {
          return {
            ...c,
            unreadCount: Math.max(0, c.unreadCount - 1)
          };
        }
        return c;
      }));
    }
  };

  return (
    <MessageContext.Provider value={{ 
      messages, 
      conversations, 
      getConversationMessages, 
      getUserConversations, 
      sendMessage, 
      markAsRead 
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
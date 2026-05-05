import { create } from 'zustand';
import { chats as initialChats, messages as initialMessages } from '../data/dummy';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  status: string;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  time: string;
  isMe: boolean;
  image?: string;
  audio?: string;
  duration?: number;
  metering?: number[];
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  replyTo?: string; // id of message being replied to
  isForwarded?: boolean;
}

export interface Chat {
  id: string;
  user: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  chats: Chat[];
  messages: Record<string, Message[]>;
  blockedUsers: string[];
  contacts: User[]; // Simulated contacts
  statusReactions: Record<string, { emoji: string, user: string }[]>;
  
  // Auth Actions
  login: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;

  // Chat Actions
  createChat: (userId: string) => void;
  deleteChat: (chatId: string) => void;

  // Message Actions
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'isMe' | 'sender'>) => void;
  editMessage: (chatId: string, messageId: string, newText: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  forwardMessage: (chatIds: string[], message: Message) => void;

  // Block Actions
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;

  // Status Actions
  addStatusReaction: (statusId: string, emoji: string) => void;
}

// Transform initial dummy messages to fit our Record type
const messagesRecord: Record<string, Message[]> = {};
Object.entries(initialMessages).forEach(([chatId, msgs]) => {
  messagesRecord[chatId] = msgs as Message[];
});

export const useStore = create<AppState>((set, get) => ({
  // Set a mock user for now, or keep null to force login flow later. We'll start null.
  currentUser: null, 
  isAuthenticated: false,
  chats: initialChats,
  messages: messagesRecord,
  blockedUsers: [],
  statusReactions: {},
  contacts: [
    { id: '1', email: 'alice@example.com', name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1', status: 'Available' },
    { id: '2', email: 'bob@example.com', name: 'Bob', avatar: 'https://i.pravatar.cc/150?img=2', status: 'Busy' },
    { id: '3', email: 'charlie@example.com', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?img=3', status: 'At work' },
    // More could be added, matching dummy.ts
  ],

  login: (email, name) => set({ 
    currentUser: { id: 'me', email, name, avatar: 'https://i.pravatar.cc/150?img=68', status: 'Hey there! I am using WhatsApp.' },
    isAuthenticated: true 
  }),

  logout: () => set({ currentUser: null, isAuthenticated: false }),

  updateProfile: (updates) => set((state) => ({
    currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
  })),

  createChat: (userId) => set((state) => {
    // If chat exists, do nothing
    if (state.chats.find(c => c.id === userId)) return state;
    
    const contact = state.contacts.find(c => c.id === userId) || { id: userId, name: 'Unknown', avatar: '' };
    const newChat: Chat = {
      id: userId,
      user: contact.name,
      avatar: contact.avatar,
      lastMessage: '',
      timestamp: '',
      unread: 0
    };
    return { chats: [newChat, ...state.chats], messages: { ...state.messages, [userId]: [] } };
  }),

  deleteChat: (chatId) => set((state) => {
    const newMessages = { ...state.messages };
    delete newMessages[chatId];
    return {
      chats: state.chats.filter(c => c.id !== chatId),
      messages: newMessages
    };
  }),

  addMessage: (chatId, message) => set((state) => {
    if (state.blockedUsers.includes(chatId)) return state; // Can't message blocked users
    
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(),
      isMe: true,
      sender: state.currentUser?.name || 'Me',
    };

    const currentChatMsgs = state.messages[chatId] || [];
    const updatedChats = state.chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, lastMessage: message.text || '📷 Media', timestamp: message.time };
      }
      return chat;
    });

    return {
      messages: { ...state.messages, [chatId]: [...currentChatMsgs, newMessage] },
      chats: updatedChats
    };
  }),

  editMessage: (chatId, messageId, newText) => set((state) => {
    const chatMsgs = state.messages[chatId];
    if (!chatMsgs) return state;

    const newMsgs = chatMsgs.map(m => m.id === messageId && m.isMe ? { ...m, text: newText } : m);
    
    // Update last message preview if it was the last one
    let updatedChats = state.chats;
    if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].id === messageId) {
      updatedChats = state.chats.map(c => c.id === chatId ? { ...c, lastMessage: newText } : c);
    }

    return { messages: { ...state.messages, [chatId]: newMsgs }, chats: updatedChats };
  }),

  deleteMessage: (chatId, messageId) => set((state) => {
    const chatMsgs = state.messages[chatId];
    if (!chatMsgs) return state;

    const newMsgs = chatMsgs.filter(m => !(m.id === messageId && m.isMe));
    
    let updatedChats = state.chats;
    if (newMsgs.length > 0) {
      updatedChats = state.chats.map(c => c.id === chatId ? { ...c, lastMessage: newMsgs[newMsgs.length - 1].text || '📷 Media' } : c);
    } else {
       updatedChats = state.chats.map(c => c.id === chatId ? { ...c, lastMessage: '' } : c);
    }

    return { messages: { ...state.messages, [chatId]: newMsgs }, chats: updatedChats };
  }),

  forwardMessage: (chatIds, message) => set((state) => {
    let newMessages = { ...state.messages };
    let updatedChats = [...state.chats];

    chatIds.forEach(chatId => {
      const fwdMsg: Message = {
        ...message,
        id: Math.random().toString(),
        isMe: true,
        sender: state.currentUser?.name || 'Me',
        isForwarded: true,
        time: '12:00 PM' // Using dummy date for now
      };
      
      const currentMsgs = newMessages[chatId] || [];
      newMessages[chatId] = [...currentMsgs, fwdMsg];

      updatedChats = updatedChats.map(c => c.id === chatId ? { ...c, lastMessage: fwdMsg.text || 'Forwarded message', timestamp: fwdMsg.time } : c);
    });

    return { messages: newMessages, chats: updatedChats };
  }),

  blockUser: (userId) => set((state) => {
    if (!state.blockedUsers.includes(userId)) {
      return { blockedUsers: [...state.blockedUsers, userId] };
    }
    return state;
  }),

  unblockUser: (userId) => set((state) => ({
    blockedUsers: state.blockedUsers.filter(id => id !== userId)
  })),

  addStatusReaction: (statusId, emoji) => set((state) => {
    const reactions = state.statusReactions[statusId] || [];
    return {
      statusReactions: {
        ...state.statusReactions,
        [statusId]: [...reactions, { emoji, user: state.currentUser?.name || 'Me' }]
      }
    };
  }),

}));

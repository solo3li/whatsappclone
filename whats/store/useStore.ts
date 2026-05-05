import { create } from 'zustand';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../constants/Config';

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
  senderId: string;
  senderName: string;
  time: string;
  isMe: boolean;
  image?: string;
  audio?: string;
  duration?: number;
  metering?: number[];
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  replyToId?: string;
  replyText?: string;
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
  token: string | null;
  isAuthenticated: boolean;
  chats: Chat[];
  messages: Record<string, Message[]>;
  blockedUsers: string[];
  contacts: User[];
  connection: signalR.HubConnection | null;
  statusReactions: Record<string, { emoji: string, user: string }[]>;
  
  // Auth Actions
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  loadStoredAuth: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, avatar: string, status: string) => Promise<void>;

  // Chat Actions
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  createChat: (userId: string) => Promise<string>;
  
  // Message Actions
  sendMessage: (chatId: string, text: string, options?: any) => Promise<void>;
  addMessage: (chatId: string, message: any) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  editMessage: (chatId: string, messageId: string, newText: string) => void;
  
  // User Actions
  searchUsers: (query: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  
  // Status Actions
  addStatusReaction: (statusId: string, emoji: string) => void;
  
  // SignalR
  startSignalR: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  token: null,
  isAuthenticated: false,
  chats: [],
  messages: {},
  blockedUsers: [],
  contacts: [],
  connection: null,
  statusReactions: {},

  requestOtp: async (email) => {
    try {
      await axios.post(`${Config.API_URL}/Auth/request-otp`, { email });
    } catch (error) {
      console.error('Request OTP failed', error);
      throw error;
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const response = await axios.post(`${Config.API_URL}/Auth/verify-otp`, { email, otp });
      const { token, user } = response.data;
      
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name || '',
        avatar: user.avatarUrl || '',
        status: user.status || ''
      };

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      set({ token, currentUser: userData, isAuthenticated: true });
      await get().startSignalR();
      await get().fetchChats();
      return true;
    } catch (error) {
      console.error('Verification failed', error);
      return false;
    }
  },

  loadStoredAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, currentUser: user, isAuthenticated: true });
        get().startSignalR();
        get().fetchChats();
      }
    } catch (error) {
      console.error('Load stored auth failed', error);
    }
  },

  logout: async () => {
    try {
      const { connection } = get();
      if (connection) await connection.stop();
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      set({ token: null, currentUser: null, isAuthenticated: false, connection: null });
    } catch (error) {
      console.error('Logout failed', error);
    }
  },

  fetchChats: async () => {
    try {
      const { token } = get();
      if (!token) return;
      const response = await axios.get(`${Config.API_URL}/Chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const chats: Chat[] = response.data.map((c: any) => ({
        id: c.id,
        user: c.name,
        avatar: c.iconUrl,
        lastMessage: c.lastMessage,
        timestamp: c.lastMessageTimestamp ? new Date(c.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unread: c.unreadCount
      }));
      set({ chats });
    } catch (error) {
      console.error('Fetch chats failed', error);
    }
  },

  fetchMessages: async (chatId) => {
    try {
      const { token } = get();
      if (!token) return;
      const response = await axios.get(`${Config.API_URL}/Chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messages: Message[] = response.data.map((m: any) => ({
        id: m.id,
        text: m.content,
        senderId: m.senderId,
        senderName: m.senderName,
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.isMe,
        image: m.imageUrl,
        audio: m.audioUrl,
        fileUri: m.fileUri,
        fileName: m.fileName,
        fileSize: m.fileSize,
        replyToId: m.replyToId,
        replyText: m.replyToContent
      }));
      set((state) => ({
        messages: { ...state.messages, [chatId]: messages }
      }));
    } catch (error) {
      console.error('Fetch messages failed', error);
    }
  },

  createChat: async (userId) => {
    try {
      const { token } = get();
      const response = await axios.post(`${Config.API_URL}/Chats`, { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await get().fetchChats();
      return response.data; // chatId
    } catch (error) {
      console.error('Create chat failed', error);
      throw error;
    }
  },

  sendMessage: async (chatId, content, type = 0) => {
    try {
      const { connection } = get();
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('SendMessage', chatId, content, type);
      }
    } catch (error) {
      console.error('Send message failed', error);
    }
  },

  addMessage: (chatId, message) => {
    set((state) => {
      const chatMsgs = state.messages[chatId] || [];
      const newMessage: Message = {
        id: Math.random().toString(),
        text: message.text || '',
        senderId: state.currentUser?.id || 'me',
        senderName: state.currentUser?.name || 'Me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        ...message
      };
      return {
        messages: { ...state.messages, [chatId]: [...chatMsgs, newMessage] }
      };
    });
  },

  deleteMessage: (chatId, messageId) => {
    set((state) => {
      const chatMsgs = state.messages[chatId] || [];
      return {
        messages: { ...state.messages, [chatId]: chatMsgs.filter(m => m.id !== messageId) }
      };
    });
  },

  editMessage: (chatId, messageId, newText) => {
    set((state) => {
      const chatMsgs = state.messages[chatId] || [];
      return {
        messages: { ...state.messages, [chatId]: chatMsgs.map(m => m.id === messageId ? { ...m, text: newText } : m) }
      };
    });
  },

  searchUsers: async (query) => {
    try {
      const { token } = get();
      const response = await axios.get(`${Config.API_URL}/User/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contacts: User[] = response.data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name || '',
        avatar: u.avatarUrl || '',
        status: u.status || ''
      }));
      set({ contacts });
    } catch (error) {
      console.error('Search users failed', error);
    }
  },

  blockUser: async (userId) => {
    set((state) => ({
      blockedUsers: [...state.blockedUsers, userId]
    }));
  },

  unblockUser: async (userId) => {
    set((state) => ({
      blockedUsers: state.blockedUsers.filter(id => id !== userId)
    }));
  },

  addStatusReaction: (statusId, emoji) => {
    set((state) => {
      const reactions = state.statusReactions[statusId] || [];
      const newReaction = { emoji, user: state.currentUser?.name || 'Me' };
      return {
        statusReactions: { ...state.statusReactions, [statusId]: [...reactions, newReaction] }
      };
    });
  },

  startSignalR: async () => {
    const { token, connection: existingConn } = get();
    if (!token || existingConn) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(Config.HUB_URL, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveMessage', (m: any) => {
      const newMessage: Message = {
        id: m.id,
        text: m.content,
        senderId: m.senderId,
        senderName: m.senderName,
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.senderId === get().currentUser?.id,
        image: m.imageUrl,
        audio: m.audioUrl,
        fileUri: m.fileUri,
        fileName: m.fileName,
        fileSize: m.fileSize,
        replyToId: m.replyToId,
        replyText: m.replyToContent
      };

      set((state) => {
        const chatMsgs = state.messages[m.chatId] || [];
        return {
          messages: { ...state.messages, [m.chatId]: [...chatMsgs, newMessage] }
        };
      });

      // Update last message in chat list
      set((state) => ({
        chats: state.chats.map(c => c.id === m.chatId ? { 
          ...c, 
          lastMessage: m.content, 
          timestamp: newMessage.time,
          unread: newMessage.isMe ? c.unread : c.unread + 1
        } : c)
      }));
    });

    connection.on('UserStatusChanged', (userId: string, isOnline: boolean, lastSeen?: string) => {
      // Handle presence updates
    });

    try {
      await connection.start();
      set({ connection });
      console.log('SignalR Connected');
    } catch (err) {
      console.error('SignalR Connection Error', err);
    }
  },

  updateProfile: async (name, avatar, status) => {
    const { token, currentUser } = get();
    await axios.put(`${Config.API_URL}/User/profile`, { name, avatarUrl: avatar, status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (currentUser) {
      const updatedUser = { ...currentUser, name, avatar, status };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ currentUser: updatedUser });
    }
  }
}));

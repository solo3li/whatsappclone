import { create } from 'zustand';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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

export interface Status {
  id: string;
  user: string;
  avatar: string;
  statusImage: string;
  time: string;
  isMe?: boolean;
}

export interface Call {
  id: string;
  user: string;
  avatar: string;
  time: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
}

interface AppState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  chats: Chat[];
  messages: Record<string, Message[]>;
  blockedUsers: string[];
  contacts: User[];
  connection: signalR.HubConnection | null;
  statusReactions: Record<string, { emoji: string, user: string }[]>;
  statuses: Status[];
  calls: Call[];
  
  // WebRTC Signaling State
  incomingCall: { from: string, offer: any } | null;
  callAnswer: any | null;
  iceCandidate: any | null;
  callHungUp: boolean;

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
  sendMessage: (chatId: string, content: string, type?: number, options?: any) => Promise<void>;
  addMessage: (chatId: string, message: any) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  editMessage: (chatId: string, messageId: string, newText: string) => void;
  
  // User Actions
  searchUsers: (query: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  
  // Status Actions
  fetchStatuses: () => Promise<void>;
  addStatusReaction: (statusId: string, emoji: string) => void;
  
  // Call Actions
  fetchCalls: () => Promise<void>;
  sendCallOffer: (targetUserId: string, offer: any) => Promise<void>;
  sendCallAnswer: (targetUserId: string, answer: any) => Promise<void>;
  sendIceCandidate: (targetUserId: string, candidate: any) => Promise<void>;
  hangUp: (targetUserId: string) => Promise<void>;
  
  // SignalR
  startSignalR: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  token: null,
  isAuthenticated: false,
  isAuthLoading: true,
  chats: [],
  messages: {},
  blockedUsers: [],
  contacts: [],
  connection: null,
  statusReactions: {},
  statuses: [],
  calls: [],
  incomingCall: null,
  callAnswer: null,
  iceCandidate: null,
  callHungUp: false,

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
    } finally {
      set({ isAuthLoading: false });
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
        avatar: c.avatar,
        lastMessage: c.lastMessage,
        timestamp: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
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
        text: m.text || '',
        senderId: m.senderId,
        senderName: m.senderName,
        time: new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.isMe,
        image: m.image,
        audio: m.audio,
        duration: m.duration,
        metering: m.metering ? JSON.parse(m.metering) : undefined,
        fileUri: m.fileUri,
        fileName: m.fileName,
        fileSize: m.fileSize,
        replyToId: m.replyToId,
        replyText: m.replyText
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

  sendMessage: async (chatId, content, type = 0, options?: any) => {
    try {
      const { connection, token } = get();

      // Handle media upload if it's a local URI or blob
      let finalContent = content;
      const isLocalUri = content.startsWith('file://') || content.startsWith('content://') || content.startsWith('blob:') || content.startsWith('data:');
      
      if (type !== 0 && isLocalUri) {
        const formData = new FormData();
        
        if (Platform.OS === 'web' || content.startsWith('blob:')) {
          const blobRes = await fetch(content);
          const blob = await blobRes.blob();
          formData.append('file', blob, options?.fileName || (type === 1 ? 'image.jpg' : type === 2 ? 'audio.m4a' : 'file'));
        } else {
          // @ts-ignore
          formData.append('file', {
            uri: content,
            name: options?.fileName || 'upload',
            type: type === 1 ? 'image/jpeg' : type === 2 ? 'audio/m4a' : 'application/octet-stream'
          });
        }

        const uploadRes = await axios.post(`${Config.API_URL}/Media/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        finalContent = uploadRes.data.url;
      }

      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('SendMessage', chatId, finalContent, type, null, options?.fileName, options?.fileSize, options?.duration, options?.metering ? JSON.stringify(options.metering) : null);
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
      const response = await axios.get(`${Config.API_URL}/Users/search?query=${query}`, {
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

  fetchStatuses: async () => {
    try {
      const { token } = get();
      if (!token) return;
      const response = await axios.get(`${Config.API_URL}/Statuses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statuses: Status[] = response.data.map((s: any) => ({
        id: s.id,
        user: s.user.name,
        avatar: s.user.avatarUrl,
        statusImage: s.imageUrl,
        time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: s.user.id === get().currentUser?.id
      }));
      set({ statuses });
    } catch (error) {
      console.error('Fetch statuses failed', error);
      // Fallback to mock if API fails or returns empty for now
      if (get().statuses.length === 0) {
        set({ statuses: [
          { id: '1', user: 'My Status', avatar: 'https://i.pravatar.cc/150?u=me', statusImage: 'https://picsum.photos/400/800', time: 'Just now', isMe: true },
          { id: '2', user: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john', statusImage: 'https://picsum.photos/400/801', time: '10:30 AM' },
        ]});
      }
    }
  },

  fetchCalls: async () => {
    try {
      const { token } = get();
      if (!token) return;
      const response = await axios.get(`${Config.API_URL}/Calls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const calls: Call[] = response.data.map((c: any) => ({
        id: c.id,
        user: c.user.name,
        avatar: c.user.avatarUrl,
        time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: c.type,
        isVideo: c.isVideo
      }));
      set({ calls });
    } catch (error) {
      console.error('Fetch calls failed', error);
    }
  },

  sendCallOffer: async (targetUserId, offer) => {
    const { connection } = get();
    if (connection) await connection.invoke('SendCallOffer', targetUserId, offer);
  },

  sendCallAnswer: async (targetUserId, answer) => {
    const { connection } = get();
    if (connection) await connection.invoke('SendCallAnswer', targetUserId, answer);
  },

  sendIceCandidate: async (targetUserId, candidate) => {
    const { connection } = get();
    if (connection) await connection.invoke('SendIceCandidate', targetUserId, candidate);
  },

  hangUp: async (targetUserId) => {
    const { connection } = get();
    if (connection) await connection.invoke('HangUp', targetUserId);
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
        text: m.text || '',
        senderId: m.senderId,
        senderName: m.senderName,
        time: new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.senderId === get().currentUser?.id,
        image: m.image,
        audio: m.audio,
        duration: m.duration,
        metering: m.metering ? JSON.parse(m.metering) : undefined,
        fileUri: m.fileUri,
        fileName: m.fileName,
        fileSize: m.fileSize,
        replyToId: m.replyToId,
        replyText: m.replyText
      };

      set((state) => {
        const chatMsgs = state.messages[m.chatId] || [];
        // Prevent duplicates
        if (chatMsgs.some(existing => existing.id === newMessage.id)) return state;
        
        return {
          messages: { ...state.messages, [m.chatId]: [...chatMsgs, newMessage] }
        };
      });

      // Update last message in chat list
      set((state) => ({
        chats: state.chats.map(c => c.id === m.chatId ? { 
          ...c, 
          lastMessage: newMessage.text || (newMessage.image ? '📷 Photo' : newMessage.audio ? '🎤 Audio' : '📄 Document'), 
          timestamp: newMessage.time,
          unread: newMessage.isMe ? c.unread : c.unread + 1
        } : c)
      }));
    });

    connection.on('UserStatusChanged', (userId: string, isOnline: boolean, lastSeen?: string) => {
      // Handle presence updates
    });

    // WebRTC Signaling Handlers
    connection.on('ReceiveCallOffer', (from, offer) => {
      set({ incomingCall: { from, offer }, callHungUp: false });
    });

    connection.on('ReceiveCallAnswer', (from, answer) => {
      set({ callAnswer: answer });
    });

    connection.on('ReceiveIceCandidate', (from, candidate) => {
      set({ iceCandidate: candidate });
    });

    connection.on('CallHungUp', (from) => {
      set({ callHungUp: true, incomingCall: null, callAnswer: null, iceCandidate: null });
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


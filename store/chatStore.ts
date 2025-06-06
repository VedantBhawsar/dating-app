import { create, StateCreator } from 'zustand';
import { messageService } from '../services/api';
import socketService from '../services/socketService';

export interface IStoreMessage {
  _id: string;
  content: string;
  messageType: string;
  sentAt: Date;
  senderId: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface IStoreUser {
  id: string;
  name: string;
  profilePicture: string;
}

export interface IStoreChat {
  chatId: string;
  lastActivity: Date;
  lastMessage: IStoreMessage | null;
  unreadCount: number;
  user: IStoreUser;
}

interface IRawMessage {
  _id?: string;
  content: string;
  messageType: string;
  sentAt: string;
  sentByMe: boolean;
}

interface IRawChat {
  chatId: string;
  lastActivity: string;
  lastMessage: IRawMessage | null;
  unreadCount: number;
  user: IStoreUser;
}

interface ChatState {
  chats: IStoreChat[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;
  fetchChats: () => Promise<void>;
  addMessageFromSocket: (chatId: string, messageData: any, newChatData?: Partial<IStoreChat>) => void;
  markChatAsReadByCurrentUser: (chatId: string, messageIds: string[]) => void;
  handleOtherUserReadReceipt: (chatId: string, readerId: string, messageIds?: string[]) => void;
  setChats: (chats: IStoreChat[]) => void;
}

const chatStoreCreator: StateCreator<ChatState> = (set, get) => ({
  chats: [],
  isLoading: false,
  error: null,
  currentUserId: null,

  setCurrentUserId: (userId: string | null) => set({ currentUserId: userId }),

  fetchChats: async () => {
    const currentUserId = get().currentUserId;
    if (!currentUserId) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const rawChats: IRawChat[] = await messageService.getChats();
      const processedChats: IStoreChat[] = rawChats.map((chat: IRawChat) => ({
        chatId: chat.chatId,
        lastActivity: new Date(chat.lastActivity),
        lastMessage: chat.lastMessage ? {
          _id: chat.lastMessage._id || Math.random().toString(36).substring(2, 9),
          content: chat.lastMessage.content,
          messageType: chat.lastMessage.messageType,
          sentAt: new Date(chat.lastMessage.sentAt),
          senderId: chat.lastMessage.sentByMe ? currentUserId : chat.user.id,
          status: 'sent',
        } : null,
        unreadCount: chat.unreadCount,
        user: chat.user,
      })).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      set({ chats: processedChats, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load chats', isLoading: false });
    }
  },

  setChats: (chats: IStoreChat[]) => set({ chats }),

  addMessageFromSocket: (chatId: string, messageData: any, newChatData?: Partial<IStoreChat>) => {
    const currentUserId = get().currentUserId;
    if (!currentUserId) return;

    const newMessage: IStoreMessage = {
      _id: messageData.id || messageData._id,
      content: messageData.content,
      messageType: messageData.messageType,
      sentAt: new Date(messageData.sentAt),
      senderId: messageData.senderId,
      status: messageData.senderId === currentUserId ? 'sent' : 'delivered',
    };

    set((state: ChatState) => {
      let chatExists = false;
      const updatedChats = state.chats.map((chat) => {
        if (chat.chatId === chatId) {
          chatExists = true;
          return {
            ...chat,
            lastMessage: newMessage,
            lastActivity: newMessage.sentAt,
            unreadCount: messageData.senderId !== currentUserId ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
          };
        }
        return chat;
      });

      if (!chatExists) {
        if (newChatData && newChatData.user) {
          const newChat: IStoreChat = {
            chatId: chatId,
            lastActivity: newMessage.sentAt,
            lastMessage: newMessage,
            unreadCount: messageData.senderId !== currentUserId ? 1 : 0,
            user: newChatData.user,
          };
          updatedChats.push(newChat);
        }
      }
      
      updatedChats.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      return { chats: updatedChats };
    });
  },

  markChatAsReadByCurrentUser: (chatId: string, messageIds: string[]) => {
    const currentUserId = get().currentUserId;
    if (!currentUserId || !messageIds || messageIds.length === 0) return;

    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.chatId === chatId ? { ...chat, unreadCount: 0 } : chat
      ),
    }));

    socketService.markMessagesAsRead(chatId, messageIds)
      .then(() => {
        console.log(`Successfully told backend to mark messages as read for chat ${chatId}`);
      })
      .catch((error) => {
        console.error(`Failed to tell backend to mark messages as read for chat ${chatId}:`, error);
        // Potentially revert optimistic update or show an error if backend call fails
      });
  },

  handleOtherUserReadReceipt: (chatId: string, readerId: string, messageIds?: string[]) => {
    const currentUserId = get().currentUserId;
    if (!currentUserId || readerId === currentUserId || !messageIds) return;

    set((state: ChatState) => ({
      chats: state.chats.map(chat => {
        if (chat.chatId === chatId && chat.lastMessage && chat.lastMessage.senderId === currentUserId) {
          if (messageIds.includes(chat.lastMessage._id)) {
            return {
              ...chat,
              lastMessage: { ...chat.lastMessage, status: 'read' },
            };
          }
        }
        return chat;
      }),
    }));
  },
});

const useChatStore = create(chatStoreCreator);

export default useChatStore;
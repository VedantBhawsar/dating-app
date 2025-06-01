import AsyncStorage from "@react-native-async-storage/async-storage";
import { SOCKET_URL } from "@/constants/config";
import { io, Socket } from "socket.io-client";

// Define event types for type safety
export type SocketEventType =
  | "connect"
  | "disconnect"
  | "connect_error"
  | "new-message"
  | "user-typing"
  | "messages-read"
  | "new-notification"
  | "error"
  | "user-info"
  | "get-user-info"
  | "join-chat";

// Define message interface
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: "TEXT" | "IMAGE";
  sentAt: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    profilePicture: string;
  };
}

// Simple event emitter implementation
class EventEmitter {
  private events: Record<string, Array<(data: any) => void>> = {};

  on(event: string, listener: (data: any) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: (data: any) => void): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event: string, data?: any): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(data));
  }
}

// Real-time Socket.IO service
class SocketService extends EventEmitter {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private userId: string | null = null;
  private currentChatId: string | null = null;

  // Initialize connection
  async connect(): Promise<void> {
    try {
      if (this.connected && this.socket) {
        console.log("Already connected");
        return;
      }

      // Get the auth token from AsyncStorage
      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        console.error("No authentication token found");
        this.emit("connect_error", {
          message: "No authentication token found",
        });
        return;
      }

      // Connect to socket server with token auth
      this.socket = io(SOCKET_URL, {
        auth: { token }
      });

      // Set up event listeners
      this.socket?.on('connect', () => {
        this.connected = true;
        console.log('Socket connected successfully');
        this.emit('connect');
        
        // Get user info
        this.socket?.emit('get-user-info');
      });

      this.socket?.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.emit('connect_error', error);
      });

      this.socket?.on('disconnect', (reason) => {
        this.connected = false;
        this.currentChatId = null;
        console.log('Socket disconnected:', reason);
        this.emit('disconnect', reason);
      });

      // Forward all events
      this.socket?.on('new-message', (data) => {
        console.log('New message received:', data);
        this.emit('new-message', data);
      });

      this.socket?.on('user-typing', (data) => {
        console.log('User typing:', data);
        this.emit('user-typing', data);
      });

      this.socket?.on('messages-read', (data) => {
        console.log('Messages read:', data);
        this.emit('messages-read', data);
      });

      this.socket?.on('new-notification', (data) => {
        console.log('New notification:', data);
        this.emit('new-notification', data);
      });

      this.socket?.on('error', (data) => {
        console.error('Socket error:', data);
        this.emit('error', data);
      });

      this.socket?.on('user-info', (data) => {
        console.log('User info received:', data);
        this.userId = data.userId;
        this.emit('user-info', data);
      });
    } catch (error) {
      console.error("Connection error:", error);
      this.emit("connect_error", { message: "Failed to connect" });
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.currentChatId = null;
    console.log("Disconnected from socket");
  }

  // Join a chat room
  joinChat(chatId: string): void {
    if (!this.connected || !this.socket) {
      console.error("Not connected to socket");
      return;
    }

    this.socket?.emit('join-chat', chatId);
    this.currentChatId = chatId;
    console.log(`Joined chat room: ${chatId}`);
  }

  // Send a message
  async sendMessage(
    chatId: string,
    content: string,
    messageType: "TEXT" | "IMAGE" = "TEXT"
  ): Promise<void> {
    if (!this.connected || !this.socket) {
      console.error("Not connected to socket");
      return;
    }

    try {
      this.socket?.emit('send-message', {
        chatId,
        content,
        messageType
      });
      console.log(`Message sent to chat ${chatId}: ${content}`);
    } catch (error) {
      console.error("Error sending message:", error);
      this.emit("error", { message: "Failed to send message" });
    }
  }

  // Send typing indicator
  async sendTypingIndicator(chatId: string): Promise<void> {
    if (!this.connected || !this.socket) {
      console.error("Not connected to socket");
      return;
    }

    try {
      this.socket?.emit('typing', chatId);
      console.log(`Typing indicator sent to chat ${chatId}`);
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(
    chatId: string,
    messageIds: string[]
  ): Promise<void> {
    if (!this.connected || !this.socket) {
      console.error("Not connected to socket");
      return;
    }

    try {
      this.socket?.emit('mark-read', {
        chatId,
        messageIds
      });
      console.log(`Marked messages as read in chat ${chatId}: ${messageIds.join(', ')}`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected && this.socket !== null;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

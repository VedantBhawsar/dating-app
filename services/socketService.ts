import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the API URL - this should match your backend
const API_URL = "https://52f8-223-185-43-120.ngrok-free.app/api";

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
  | "user-info";

// Define message interface
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: "TEXT" | "IMAGE";
  createdAt: string;
  isRead: boolean;
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

// Simplified socket service that uses polling instead of WebSockets
class SocketService extends EventEmitter {
  private connected: boolean = false;
  private userId: string | null = null;
  private currentChatId: string | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastMessageTimestamp: number = Date.now();

  // Initialize connection
  async connect(): Promise<void> {
    try {
      if (this.connected) {
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

      // Get user info
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (userInfo) {
        const parsedUserInfo = JSON.parse(userInfo);
        this.userId = parsedUserInfo.id;
      }

      this.connected = true;
      this.emit("connect");
      console.log("Connected successfully");

      // Start polling for new messages
      this.startPolling();
    } catch (error) {
      console.error("Connection error:", error);
      this.emit("connect_error", { message: "Failed to connect" });
    }
  }

  // Start polling for new messages
  private startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Poll every 3 seconds
    this.pollingInterval = setInterval(async () => {
      if (!this.connected || !this.currentChatId) return;

      try {
        // Get new messages since last check
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch(
          `${API_URL}/chats/${this.currentChatId}/messages?since=${this.lastMessageTimestamp}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const newMessages = await response.json();
          if (newMessages && newMessages.length > 0) {
            // Update last message timestamp
            this.lastMessageTimestamp = Date.now();

            // Emit new messages
            newMessages.forEach((message: Message) => {
              this.emit("new-message", message);
            });
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);
  }

  // Disconnect
  disconnect(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.connected = false;
    this.currentChatId = null;
    this.emit("disconnect", "Client disconnected");
    console.log("Disconnected");
  }

  // Join a chat room
  joinChat(chatId: string): void {
    if (!this.connected) {
      console.error("Not connected");
      return;
    }

    this.currentChatId = chatId;
    this.lastMessageTimestamp = Date.now();
    console.log(`Joined chat room: ${chatId}`);
  }

  // Send a message
  async sendMessage(
    chatId: string,
    content: string,
    messageType: "TEXT" | "IMAGE" = "TEXT"
  ): Promise<void> {
    if (!this.connected) {
      console.error("Not connected");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          messageType,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        // Emit the new message locally to update UI immediately
        this.emit("new-message", newMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      this.emit("error", { message: "Failed to send message" });
    }
  }

  // Send typing indicator
  async sendTypingIndicator(chatId: string): Promise<void> {
    if (!this.connected) {
      console.error("Not connected");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      await fetch(`${API_URL}/chats/${chatId}/typing`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(
    chatId: string,
    messageIds: string[]
  ): Promise<void> {
    if (!this.connected) {
      console.error("Not connected");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`${API_URL}/chats/${chatId}/messages/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageIds,
        }),
      });

      if (response.ok) {
        // Emit the read receipts locally
        this.emit("messages-read", { chatId, messageIds });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

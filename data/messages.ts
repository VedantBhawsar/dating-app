export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  isSender: boolean;
}

export const messages: { [key: string]: Message[] } = {
  '1': [
    {
      id: '1',
      chatId: '1',
      senderId: '1',
      text: 'Hi there! How are you doing today?',
      timestamp: '12:20 PM',
      isRead: true,
      isSender: false
    },
    {
      id: '2',
      chatId: '1',
      senderId: 'user',
      text: "Hey! I'm doing great, thanks for asking. How about you?",
      timestamp: '12:21 PM',
      isRead: true,
      isSender: true
    },
    {
      id: '3',
      chatId: '1',
      senderId: '1',
      text: "I'm doing well too! Would you like to grab coffee sometime this week?",
      timestamp: '12:22 PM',
      isRead: true,
      isSender: false
    },
    {
      id: '4',
      chatId: '1',
      senderId: 'user',
      text: "That sounds great! How about tomorrow at 3 PM?",
      timestamp: '12:22 PM',
      isRead: true,
      isSender: true
    },
    {
      id: '5',
      chatId: '1',
      senderId: '1',
      text: "Hello Joshika!",
      timestamp: '12:23 PM',
      isRead: false,
      isSender: false
    }
  ],
  '2': [
    {
      id: '6',
      chatId: '2',
      senderId: '2',
      text: "Hey, I'm on my way to the meeting point!",
      timestamp: '12:10 PM',
      isRead: true,
      isSender: false
    },
    {
      id: '7',
      chatId: '2',
      senderId: 'user',
      text: "Great! I'm already here, waiting at the entrance.",
      timestamp: '12:12 PM',
      isRead: true,
      isSender: true
    },
    {
      id: '8',
      chatId: '2',
      senderId: '2',
      text: "I'm arriving very soon.",
      timestamp: '12:15 PM',
      isRead: true,
      isSender: false
    }
  ]
}; 
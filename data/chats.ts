export interface Chat {
  id: string;
  name: string;
  message: string;
  image: string;
  time?: string;
  unreadCount?: number;
}

export const chats: Chat[] = [
  {
    id: '1',
    name: 'Abdul Maghni',
    message: 'Hello Joshika!',
    time: '12:23 PM',
    image: 'https://i.pravatar.cc/150?img=1',
    unreadCount: 2
  },
  {
    id: '2',
    name: 'Nora Sofyan',
    message: "I'm arriving very soon.",
    time: '12:15 PM',
    image: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: '3',
    name: 'Adithya Panth',
    message: 'Great work!',
    time: '11:30 AM',
    image: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: '4',
    name: 'Vitho Arvy',
    message: 'Bye',
    time: '11:22 AM',
    image: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: '5',
    name: 'Inam Zuhry',
    message: "I'll meet you soon.",
    time: '10:02 AM',
    image: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: '6',
    name: 'Sarah Wilson',
    message: 'The event was amazing!',
    time: '9:45 AM',
    image: 'https://i.pravatar.cc/150?img=6'
  },
  {
    id: '7',
    name: 'Mike Chen',
    message: 'Thanks for your help yesterday',
    time: '9:30 AM',
    image: 'https://i.pravatar.cc/150?img=7',
    unreadCount: 1
  },
  {
    id: '8',
    name: 'Emma Thompson',
    message: 'Looking forward to the weekend',
    time: '9:15 AM',
    image: 'https://i.pravatar.cc/150?img=8'
  },
  {
    id: '9',
    name: 'James Rodriguez',
    message: 'The meeting is scheduled for 3 PM',
    time: '9:00 AM',
    image: 'https://i.pravatar.cc/150?img=9',
    unreadCount: 3
  },
  {
    id: '10',
    name: 'Lisa Park',
    message: 'Did you see the latest update?',
    time: '8:45 AM',
    image: 'https://i.pravatar.cc/150?img=10'
  },
  {
    id: '11',
    name: 'David Kim',
    message: 'Coffee tomorrow morning?',
    time: 'Yesterday',
    image: 'https://i.pravatar.cc/150?img=11'
  },
  {
    id: '12',
    name: 'Sophie Martin',
    message: 'The presentation went well!',
    time: 'Yesterday',
    image: 'https://i.pravatar.cc/150?img=12',
    unreadCount: 5
  }
]; 
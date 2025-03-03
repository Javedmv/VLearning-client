export interface User {
    id: string;
    name: string;
    avatar: string;
    role: 'student' | 'instructor';
    lastSeen: string;
  }
  
  export interface Message {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
  }
  
  export interface Chat {
    userId: string;
    messages: Message[];
}


export const users: User[] = [
  {
    id: '1',
    name: 'John Smith',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
    role: 'student',
    lastSeen: '2 mins ago'
  },
  {
    id: '2',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    role: 'student',
    lastSeen: '5 mins ago'
  },
  {
    id: '3',
    name: 'Michael Brown',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    role: 'student',
    lastSeen: 'online'
  }
];

export const chats: Chat[] = [
  {
    userId: '1',
    messages: [
      {
        id: '1',
        userId: '1',
        content: 'Hi professor, I have a question about the assignment.',
        timestamp: '2024-03-10T10:00:00Z'
      },
      {
        id: '2',
        userId: 'instructor',
        content: 'Sure, what can I help you with?',
        timestamp: '2024-03-10T10:01:00Z'
      }
    ]
  },
  {
    userId: '2',
    messages: [
      {
        id: '3',
        userId: '2',
        content: 'When is the next quiz?',
        timestamp: '2024-03-10T09:00:00Z'
      },
      {
        id: '4',
        userId: 'instructor',
        content: 'The quiz will be next Monday.',
        timestamp: '2024-03-10T09:01:00Z'
      }
    ]
  },
  {
    userId: '3',
    messages: [
      {
        id: '5',
        userId: '3',
        content: 'Thank you for the feedback on my project!',
        timestamp: '2024-03-09T15:00:00Z'
      },
      {
        id: '6',
        userId: 'instructor',
        content: 'You\'re welcome! Keep up the good work.',
        timestamp: '2024-03-09T15:02:00Z'
      }
    ]
  }
];
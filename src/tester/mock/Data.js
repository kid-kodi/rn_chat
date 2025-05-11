// Mock data for active chats
export const activeChats = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    lastMessage: 'Are we still meeting tomorrow?',
    time: '5m ago',
    unread: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'I sent you the document you asked for',
    time: '27m ago',
    unread: 0,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Design Team',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    lastMessage: 'Alex: The new mockups look great!',
    time: '2h ago',
    unread: 5,
    isOnline: false,
    isGroup: true,
    participants: 4,
  },
  {
    id: '4',
    name: 'David Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    lastMessage: 'Thanks for your help yesterday',
    time: '1d ago',
    unread: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Emma Thompson',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    lastMessage: 'Can you call me when you\'re free?',
    time: '2d ago',
    unread: 0,
    isOnline: false,
  },
  {
    id: '6',
    name: 'Project X Team',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    lastMessage: 'Jessica: Meeting postponed to Friday',
    time: '3d ago',
    unread: 0,
    isOnline: false,
    isGroup: true,
    participants: 6,
  },
  {
    id: '7',
    name: 'Thomas Brown',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    lastMessage: 'Let me know when you\'ve reviewed the proposal',
    time: '4d ago',
    unread: 0,
    isOnline: false,
  },
];

// Mock data for archived chats
export const archivedChats = [
  {
    id: '8',
    name: 'Marketing Team',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    lastMessage: 'Robert: Final campaign assets are ready',
    time: '1w ago',
    unread: 0,
    isGroup: true,
    participants: 8,
  },
  {
    id: '9',
    name: 'James Peterson',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    lastMessage: 'Thanks for the information',
    time: '2w ago',
    unread: 0,
  },
  {
    id: '10',
    name: 'Sophia Garcia',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    lastMessage: 'See you at the conference next month',
    time: '3w ago',
    unread: 0,
  },
];


export const callsData = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      type: 'incoming', // incoming, outgoing, missed
      callType: 'video', // audio, video
      time: '10:30 AM',
      date: 'Today',
      duration: '5:24',
      missed: false,
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      type: 'outgoing',
      callType: 'audio',
      time: '9:15 AM',
      date: 'Today',
      duration: '2:07',
      missed: false,
    },
    {
      id: '3',
      name: 'Emma Thompson',
      avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
      type: 'missed',
      callType: 'video',
      time: '8:45 AM',
      date: 'Today',
      duration: '0:00',
      missed: true,
    },
    {
      id: '4',
      name: 'Design Team',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
      type: 'outgoing',
      callType: 'video',
      time: '5:30 PM',
      date: 'Yesterday',
      duration: '32:16',
      missed: false,
      isGroup: true,
      participants: 4,
    },
    {
      id: '5',
      name: 'David Wilson',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      type: 'incoming',
      callType: 'audio',
      time: '3:22 PM',
      date: 'Yesterday',
      duration: '1:45',
      missed: false,
    },
    {
      id: '6',
      name: 'Thomas Brown',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      type: 'missed',
      callType: 'audio',
      time: '11:50 AM',
      date: 'Yesterday',
      duration: '0:00',
      missed: true,
    },
    {
      id: '7',
      name: 'Jessica Adams',
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
      type: 'incoming',
      callType: 'video',
      time: '4:15 PM',
      date: '2 days ago',
      duration: '8:32',
      missed: false,
    },
    {
      id: '8',
      name: 'Project X Team',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      type: 'outgoing',
      callType: 'video',
      time: '10:00 AM',
      date: '2 days ago',
      duration: '45:10',
      missed: false,
      isGroup: true,
      participants: 6,
    },
  ];


export const allContacts = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    phone: '+1 (555) 123-4567',
    online: true,
    favorite: true,
  },
  {
    id: '2',
    name: 'Beth Williams',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    phone: '+1 (555) 234-5678',
    online: false,
    favorite: true,
  },
  {
    id: '3',
    name: 'Carlos Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    phone: '+1 (555) 345-6789',
    online: false,
    favorite: false,
  },
  {
    id: '4',
    name: 'Design Team',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    members: 5,
    isGroup: true,
    favorite: true,
  },
  {
    id: '5',
    name: 'Emma Thompson',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    phone: '+1 (555) 456-7890',
    online: true,
    favorite: false,
  },
  {
    id: '6',
    name: 'Frank Smith',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    phone: '+1 (555) 567-8901',
    online: false,
    favorite: false,
  },
  {
    id: '7',
    name: 'Grace Lee',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    phone: '+1 (555) 678-9012',
    online: true,
    favorite: false,
  },
  {
    id: '8',
    name: 'Henry Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    phone: '+1 (555) 789-0123',
    online: false,
    favorite: false,
  },
  {
    id: '9',
    name: 'Isabella Martinez',
    avatar: 'https://randomuser.me/api/portraits/women/9.jpg',
    phone: '+1 (555) 890-1234',
    online: false,
    favorite: false,
  },
  {
    id: '10',
    name: 'James Taylor',
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    phone: '+1 (555) 901-2345',
    online: true,
    favorite: false,
  },
  {
    id: '11',
    name: 'Kelly Adams',
    avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
    phone: '+1 (555) 012-3456',
    online: false,
    favorite: false,
  },
  {
    id: '12',
    name: 'Marketing Team',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    members: 8,
    isGroup: true,
    favorite: false,
  },
  {
    id: '13',
    name: 'Nicholas Brown',
    avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
    phone: '+1 (555) 123-4567',
    online: false,
    favorite: false,
  },
  {
    id: '14',
    name: 'Olivia Garcia',
    avatar: 'https://randomuser.me/api/portraits/women/14.jpg',
    phone: '+1 (555) 234-5678',
    online: true,
    favorite: false,
  },
  {
    id: '15',
    name: 'Project X Team',
    avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
    members: 6,
    isGroup: true,
    favorite: true,
  },
];


export const recentChats = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      lastMessage: 'Are we still meeting tomorrow?',
      time: '5m ago',
      unread: 2,
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      lastMessage: 'I sent you the document you asked for',
      time: '27m ago',
      unread: 0,
    },
    {
      id: '3',
      name: 'Design Team',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
      lastMessage: 'Alex: The new mockups look great!',
      time: '2h ago',
      unread: 5,
    },
    {
      id: '4',
      name: 'David Wilson',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      lastMessage: 'Thanks for your help yesterday',
      time: '1d ago',
      unread: 0,
    },
    {
      id: '5',
      name: 'Emma Thompson',
      avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
      lastMessage: 'Can you call me when you\'re free?',
      time: '2d ago',
      unread: 0,
    },
  ];

// Mock data for online friends
export const onlineFriends = [
  {
    id: '1',
    name: 'Jessica',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  {
    id: '2',
    name: 'Ryan',
    avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
  },
  {
    id: '3',
    name: 'Olivia',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
  },
  {
    id: '4',
    name: 'Thomas',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
  {
    id: '5',
    name: 'Sophie',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
  },
];


export const notifications = [
  { id: '1', title: 'New message from Alice' },
  { id: '2', title: 'Bob commented on your post' },
];


export const chat_messages = [
  {
    id: '1',
    senderId: '2', // contactId
    senderName: 'John Doe',
    text: 'Hey there! How are you doing?',
    timestamp: '10:30 AM',
    read: true,
    type: 'text'
  },
  {
    id: '2',
    senderId: '1', // current user
    text: 'I\'m good! Just working on that React Native app we discussed.',
    timestamp: '10:32 AM',
    read: true,
    type: 'text'
  },
  {
    id: '3',
    senderId: '2',
    senderName: 'John Doe',
    text: 'Great! Can you send me the design files?',
    timestamp: '10:33 AM',
    read: true,
    type: 'text'
  },
  {
    id: '4',
    senderId: '1',
    text: 'Sure, here they are!',
    timestamp: '10:35 AM',
    read: true,
    type: 'text'
  },
  {
    id: '5',
    senderId: '1',
    file: {
      name: 'AppDesign.pdf',
      uri: 'https://example.com/files/design.pdf',
      size: '2.4 MB',
      type: 'application/pdf'
    },
    timestamp: '10:35 AM',
    read: true,
    type: 'file'
  },
  {
    id: '6',
    senderId: '2',
    senderName: 'John Doe',
    image: 'https://via.placeholder.com/300x200',
    timestamp: '10:38 AM',
    read: true,
    type: 'image'
  },
  {
    id: '7',
    senderId: '2',
    senderName: 'John Doe',
    text: 'What do you think about this mockup?',
    timestamp: '10:38 AM',
    read: true,
    type: 'text'
  },
  {
    id: '8',
    senderId: '1',
    audio: {
      uri: 'https://example.com/audio/feedback.mp3',
      duration: '0:32'
    },
    timestamp: '10:42 AM',
    read: true,
    type: 'audio'
  },
  {
    id: '9',
    senderId: '2',
    senderName: 'John Doe',
    video: {
      uri: 'https://example.com/videos/demo.mp4',
      thumbnail: 'https://via.placeholder.com/300x200'
    },
    timestamp: '10:45 AM',
    read: false,
    type: 'video'
  }
]
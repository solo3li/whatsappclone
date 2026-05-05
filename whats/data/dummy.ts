export const chats = [
  { id: '1', user: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1', lastMessage: 'Hey, are we still on for tonight?', timestamp: '10:30 AM', unread: 2 },
  { id: '2', user: 'Bob', avatar: 'https://i.pravatar.cc/150?img=2', lastMessage: 'Check out this funny meme! 😂', timestamp: 'Yesterday', unread: 0 },
  { id: '3', user: 'Charlie', avatar: 'https://i.pravatar.cc/150?img=3', lastMessage: 'Let me know when you finish the report.', timestamp: 'Tuesday', unread: 1 },
  { id: '4', user: 'David', avatar: 'https://i.pravatar.cc/150?img=4', lastMessage: 'Sounds good to me.', timestamp: 'Monday', unread: 0 },
  { id: '5', user: 'Emma', avatar: 'https://i.pravatar.cc/150?img=5', lastMessage: 'Can you call me?', timestamp: 'Last week', unread: 0 },
  { id: '6', user: 'Frank', avatar: 'https://i.pravatar.cc/150?img=6', lastMessage: 'I sent the files over email.', timestamp: '12:45 PM', unread: 5 },
  { id: '7', user: 'Grace', avatar: 'https://i.pravatar.cc/150?img=7', lastMessage: 'Thanks for your help!', timestamp: '9:15 AM', unread: 0 },
  { id: '8', user: 'Henry', avatar: 'https://i.pravatar.cc/150?img=8', lastMessage: 'Are we meeting at the cafe?', timestamp: 'Yesterday', unread: 1 },
  { id: '9', user: 'Isabella', avatar: 'https://i.pravatar.cc/150?img=9', lastMessage: 'Loved the movie yesterday.', timestamp: 'Wednesday', unread: 0 },
  { id: '10', user: 'Jack', avatar: 'https://i.pravatar.cc/150?img=10', lastMessage: 'Can we reschedule?', timestamp: 'Monday', unread: 0 },
  { id: '11', user: 'Karen', avatar: 'https://i.pravatar.cc/150?img=11', lastMessage: 'Where are you?', timestamp: 'Sunday', unread: 3 },
  { id: '12', user: 'Liam', avatar: 'https://i.pravatar.cc/150?img=12', lastMessage: 'I will be late by 10 mins.', timestamp: 'Saturday', unread: 0 },
  { id: '13', user: 'Mia', avatar: 'https://i.pravatar.cc/150?img=13', lastMessage: 'Happy Birthday! 🎂', timestamp: 'Friday', unread: 0 },
  { id: '14', user: 'Noah', avatar: 'https://i.pravatar.cc/150?img=14', lastMessage: 'Did you see the news?', timestamp: 'Thursday', unread: 0 },
  { id: '15', user: 'Olivia', avatar: 'https://i.pravatar.cc/150?img=15', lastMessage: 'I am so tired.', timestamp: 'Last week', unread: 1 },
  { id: '16', user: 'Peter', avatar: 'https://i.pravatar.cc/150?img=16', lastMessage: 'Let\'s go hiking this weekend.', timestamp: 'Last week', unread: 0 },
  { id: '17', user: 'Quinn', avatar: 'https://i.pravatar.cc/150?img=17', lastMessage: 'I got the job!', timestamp: '2 weeks ago', unread: 0 },
  { id: '18', user: 'Rachel', avatar: 'https://i.pravatar.cc/150?img=18', lastMessage: 'Can I borrow your book?', timestamp: '2 weeks ago', unread: 0 },
  { id: '19', user: 'Sam', avatar: 'https://i.pravatar.cc/150?img=19', lastMessage: 'See you tomorrow.', timestamp: '3 weeks ago', unread: 0 },
  { id: '20', user: 'Tina', avatar: 'https://i.pravatar.cc/150?img=20', lastMessage: 'Okay, sounds like a plan.', timestamp: 'Last month', unread: 0 },
];

export const messages = {
  '1': [
    { id: 'm1', text: 'Hey there!', sender: 'Alice', time: '10:00 AM', isMe: false },
    { id: 'm2', text: 'Hi Alice! How are you?', sender: 'Me', time: '10:05 AM', isMe: true },
    { id: 'm3', text: 'I am good! Hey, are we still on for tonight?', sender: 'Alice', time: '10:30 AM', isMe: false },
  ],
  '2': [
    { id: 'm1', text: 'Dude you have to see this', sender: 'Bob', time: 'Yesterday', isMe: false },
    { id: 'm2', text: 'Check out this funny meme! 😂', sender: 'Bob', time: 'Yesterday', isMe: false },
  ],
  '3': [
    { id: 'm1', text: 'Have you started on the report?', sender: 'Charlie', time: 'Tuesday', isMe: false },
    { id: 'm2', text: 'Just started it today.', sender: 'Me', time: 'Tuesday', isMe: true },
    { id: 'm3', text: 'Let me know when you finish the report.', sender: 'Charlie', time: 'Tuesday', isMe: false },
  ],
  '6': [
    { id: 'm1', text: 'I need those files urgently.', sender: 'Frank', time: '12:00 PM', isMe: false },
    { id: 'm2', text: 'Sending them now.', sender: 'Me', time: '12:05 PM', isMe: true },
    { id: 'm3', text: 'I sent the files over email.', sender: 'Frank', time: '12:45 PM', isMe: false },
  ],
  '7': [
    { id: 'm1', text: 'Can you help me with this bug?', sender: 'Grace', time: '9:00 AM', isMe: false },
    { id: 'm2', text: 'Sure, let\'s look at it.', sender: 'Me', time: '9:05 AM', isMe: true },
    { id: 'm3', text: 'Thanks for your help!', sender: 'Grace', time: '9:15 AM', isMe: false },
  ],
  '13': [
    { id: 'm1', text: 'Happy Birthday! 🎂', sender: 'Mia', time: 'Friday', isMe: false },
    { id: 'm2', text: 'Thank you so much Mia!', sender: 'Me', time: 'Friday', isMe: true },
  ]
};

export const calls = [
  { id: '1', user: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1', time: 'Today, 10:30 AM', type: 'missed', isVideo: false },
  { id: '2', user: 'Charlie', avatar: 'https://i.pravatar.cc/150?img=3', time: 'Yesterday, 8:45 PM', type: 'outgoing', isVideo: true },
  { id: '3', user: 'Frank', avatar: 'https://i.pravatar.cc/150?img=6', time: 'Yesterday, 2:15 PM', type: 'incoming', isVideo: false },
  { id: '4', user: 'Emma', avatar: 'https://i.pravatar.cc/150?img=5', time: 'Monday, 11:00 AM', type: 'missed', isVideo: true },
  { id: '5', user: 'David', avatar: 'https://i.pravatar.cc/150?img=4', time: 'Sunday, 9:30 AM', type: 'outgoing', isVideo: false },
  { id: '6', user: 'Grace', avatar: 'https://i.pravatar.cc/150?img=7', time: 'Saturday, 5:45 PM', type: 'incoming', isVideo: true },
  { id: '7', user: 'Henry', avatar: 'https://i.pravatar.cc/150?img=8', time: 'Friday, 1:20 PM', type: 'missed', isVideo: false },
  { id: '8', user: 'Isabella', avatar: 'https://i.pravatar.cc/150?img=9', time: 'Thursday, 10:10 AM', type: 'incoming', isVideo: true },
  { id: '9', user: 'Jack', avatar: 'https://i.pravatar.cc/150?img=10', time: 'Wednesday, 4:00 PM', type: 'outgoing', isVideo: false },
  { id: '10', user: 'Karen', avatar: 'https://i.pravatar.cc/150?img=11', time: 'Tuesday, 7:50 PM', type: 'missed', isVideo: true },
  { id: '11', user: 'Liam', avatar: 'https://i.pravatar.cc/150?img=12', time: 'Last week', type: 'incoming', isVideo: false },
  { id: '12', user: 'Mia', avatar: 'https://i.pravatar.cc/150?img=13', time: 'Last week', type: 'outgoing', isVideo: true },
];

export const updates = [
  { id: '1', user: 'My status', avatar: 'https://i.pravatar.cc/150?img=11', time: 'Tap to add status update', isMe: true },
  { id: '2', user: 'David', avatar: 'https://i.pravatar.cc/150?img=4', time: '45 minutes ago', isMe: false },
  { id: '3', user: 'Emma', avatar: 'https://i.pravatar.cc/150?img=5', time: 'Today, 9:20 AM', isMe: false },
  { id: '4', user: 'Frank', avatar: 'https://i.pravatar.cc/150?img=6', time: 'Today, 8:15 AM', isMe: false },
  { id: '5', user: 'Grace', avatar: 'https://i.pravatar.cc/150?img=7', time: 'Yesterday, 11:30 PM', isMe: false },
  { id: '6', user: 'Henry', avatar: 'https://i.pravatar.cc/150?img=8', time: 'Yesterday, 9:00 PM', isMe: false },
  { id: '7', user: 'Isabella', avatar: 'https://i.pravatar.cc/150?img=9', time: 'Yesterday, 6:45 PM', isMe: false },
  { id: '8', user: 'Jack', avatar: 'https://i.pravatar.cc/150?img=10', time: 'Yesterday, 5:20 PM', isMe: false },
  { id: '9', user: 'Karen', avatar: 'https://i.pravatar.cc/150?img=11', time: 'Yesterday, 2:10 PM', isMe: false },
  { id: '10', user: 'Liam', avatar: 'https://i.pravatar.cc/150?img=12', time: 'Yesterday, 10:05 AM', isMe: false },
];

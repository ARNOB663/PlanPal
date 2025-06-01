export const mockUsers = [
  {
    id: '1',
    email: 'sophia@example.com',
    password: 'demo123', // This is only for demonstration purposes
    name: 'Sophia Chen',
    bio: 'Adventure seeker and photography enthusiast',
    gender: 'female',
    age: 28,
    photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    location: 'San Francisco, CA',
    interests: ['hiking', 'photography', 'travel']
  },
  {
    id: '2',
    email: 'james@example.com',
    password: 'demo123',
    name: 'James Wilson',
    bio: 'Sports fanatic and coffee lover',
    gender: 'male',
    age: 32,
    photo_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    location: 'New York, NY',
    interests: ['basketball', 'coffee', 'music']
  },
  {
    id: '3',
    email: 'emma@example.com',
    password: 'demo123',
    name: 'Emma Thompson',
    bio: 'Art curator and yoga instructor',
    gender: 'female',
    age: 30,
    photo_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    location: 'Los Angeles, CA',
    interests: ['art', 'yoga', 'meditation']
  }
];

export const mockEvents = [
  {
    id: '1',
    title: 'Weekend Hiking Adventure',
    description: 'Join us for a scenic hike in the mountains',
    date: '2025-03-15',
    time: '09:00',
    location: 'Mount Tamalpais State Park',
    coordinates: { lat: 37.8899, lng: -122.6253 },
    creatorId: '1',
    maxParticipants: 10,
    participants: [],
    pendingParticipants: [],
    interestedUsers: [],
    genderPreference: 'any',
    ageRange: { min: 21, max: 45 },
    category: 'Other',
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
    photos: [],
    taggedUsers: [],
    venue: {
      name: 'Mount Tamalpais State Park',
      address: '3801 Panoramic Hwy, Mill Valley, CA 94941',
      parking: 'Available at the main parking lot',
      transit: 'Marin Transit Route 61'
    }
  },
  {
    id: '2',
    title: 'Downtown Art Gallery Tour',
    description: 'Explore local art galleries and meet fellow art enthusiasts',
    date: '2025-03-20',
    time: '14:00',
    location: 'Downtown Art District',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    creatorId: '3',
    maxParticipants: 15,
    participants: [],
    pendingParticipants: [],
    interestedUsers: [],
    genderPreference: 'any',
    ageRange: { min: 18, max: 50 },
    category: 'Other',
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg',
    photos: [],
    taggedUsers: [],
    venue: {
      name: 'Downtown Art District',
      address: '123 Art Street, San Francisco, CA 94105',
      parking: 'Street parking and nearby garages available',
      transit: 'BART and Muni stations within walking distance'
    }
  }
];

export const mockMessages = [
  {
    id: '1',
    sender_id: '1',
    receiver_id: '2',
    content: 'Hey, are you interested in joining the hiking event?',
    read: false,
    created_at: '2025-03-10T10:00:00Z'
  },
  {
    id: '2',
    sender_id: '2',
    receiver_id: '1',
    content: 'Yes, that sounds great! What time does it start?',
    read: true,
    created_at: '2025-03-10T10:05:00Z'
  }
];

export const mockConversations = [
  {
    id: '1',
    participants: [
      {
        id: '1',
        name: 'Sophia Chen',
        photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
      },
      {
        id: '2',
        name: 'James Wilson',
        photo_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
      }
    ],
    lastMessage: {
      content: 'Yes, that sounds great! What time does it start?',
      created_at: '2025-03-10T10:05:00Z',
      sender_id: '2'
    },
    unreadCount: 1
  },
  {
    id: '2',
    participants: [
      {
        id: '1',
        name: 'Sophia Chen',
        photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
      },
      {
        id: '3',
        name: 'Emma Thompson',
        photo_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
      }
    ],
    lastMessage: {
      content: 'Would you like to join my art gallery tour?',
      created_at: '2025-03-09T15:30:00Z',
      sender_id: '3'
    },
    unreadCount: 0
  }
];
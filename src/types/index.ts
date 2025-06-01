export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  photoUrl: string;
  location: string;
  interests: string[];
  eventsCreated: string[];
  eventsJoined: string[];
  friends: string[];
  friendRequests: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  creatorId: string;
  maxParticipants: number;
  participants: string[];
  pendingParticipants: string[];
  interestedUsers: string[];
  genderPreference: 'female' | 'male' | 'any';
  ageRange: {
    min: number;
    max: number;
  };
  category: 'Concert' | 'Sports' | 'Party' | 'Conference' | 'Workshop' | 'Other';
  visibility: 'public' | 'friends';
  imageUrl: string;
  photos: string[];
  taggedUsers: string[];
  venue: {
    name: string;
    address: string;
    parking?: string;
    transit?: string;
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface ParticipationRequest {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  message?: string;
}

export type FilterOptions = {
  category: string;
  location: string;
  date: string;
  genderPreference: 'female' | 'male' | 'any' | '';
  ageRange: {
    min: number;
    max: number;
  };
};
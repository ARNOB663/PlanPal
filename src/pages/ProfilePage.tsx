import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Mail, UserCheck, Settings, User as UserIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import EventCard from '../components/events/EventCard';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { mockUsers as users } from '../data/mockData';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { events } = useEvents();
  
  // If no ID is provided, show the current user's profile
  const profileUser = id 
    ? users.find(user => user.id === id) 
    : currentUser;
  
  if (!profileUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }
  
  const isCurrentUser = currentUser?.id === profileUser.id;
  
  // Get events created by this user
  const createdEvents = events.filter(event => event.creatorId === profileUser.id);
  
  // Get events joined by this user
  const joinedEvents = events.filter(
    event => event.creatorId !== profileUser.id && event.participants.includes(profileUser.id)
  );
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg overflow-hidden">
            <div className="h-full w-full bg-indigo-500 opacity-20"></div>
          </div>
          
          {/* Profile Info */}
          <div className="absolute transform -translate-y-1/2 left-8 top-64 flex items-end">
            {profileUser.photoUrl ? (
              <img 
                src={profileUser.photoUrl} 
                alt={profileUser.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-200 flex items-center justify-center shadow-md">
                <UserIcon size={48} className="text-indigo-600" />
              </div>
            )}
            
            <div className="ml-6 pb-2">
              <h1 className="text-3xl font-bold text-gray-800">{profileUser.name}</h1>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin size={16} className="mr-1 text-indigo-500" />
                <span>{profileUser.location}</span>
                <span className="mx-2">•</span>
                <span>{profileUser.gender}, {profileUser.age}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-72 right-8">
            {isCurrentUser ? (
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center">
                <Settings size={16} className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-3">
                <button className="bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600 font-medium py-2 px-4 rounded-md transition-colors flex items-center">
                  <Mail size={16} className="mr-2" />
                  Message
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center">
                  <UserCheck size={16} className="mr-2" />
                  Follow
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Profile Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* About */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About</h2>
                <p className="text-gray-700 mb-6">{profileUser.bio}</p>
                
                <h3 className="font-semibold text-gray-800 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileUser.interests.map(interest => (
                    <span 
                      key={interest}
                      className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{createdEvents.length}</p>
                    <p className="text-gray-600">Events Created</p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{joinedEvents.length}</p>
                    <p className="text-gray-600">Events Joined</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Created Events */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Events Created</h2>
              
              {createdEvents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600 mb-4">No events created yet.</p>
                  {isCurrentUser && (
                    <a 
                      href="/create-event"
                      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Create Your First Event
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {createdEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
            
            {/* Joined Events */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Events Joined</h2>
              
              {joinedEvents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600 mb-4">No events joined yet.</p>
                  {isCurrentUser && (
                    <a 
                      href="/"
                      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Find Events to Join
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {joinedEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
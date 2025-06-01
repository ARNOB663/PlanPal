import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Heart, Share2, Flag, MessageCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import UserCard from '../components/users/UserCard';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useMessages } from '../context/MessageContext';
import { mockUsers as users } from '../data/mockData';
import { format } from 'date-fns';

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getEventById, joinEvent, leaveEvent, showInterest } = useEvents();
  const { sendMessage } = useMessages();
  
  const event = getEventById(id || '');
  
  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }
  
  const creator = users.find(user => user.id === event.creatorId);
  const participants = users.filter(user => event.participants.includes(user.id));
  const interestedUsers = users.filter(user => event.interestedUsers.includes(user.id));
  
  const isCreator = currentUser?.id === event.creatorId;
  const isParticipant = currentUser ? event.participants.includes(currentUser.id) : false;
  const isInterested = currentUser ? event.interestedUsers.includes(currentUser.id) : false;
  const isFull = event.participants.length >= event.maxParticipants;
  
  const handleJoin = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (isParticipant) {
      leaveEvent(event.id, currentUser.id);
    } else {
      joinEvent(event.id, currentUser.id);
    }
  };
  
  const handleInterest = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!isParticipant && !isInterested) {
      showInterest(event.id, currentUser.id);
    }
  };
  
  const handleContactCreator = () => {
    if (!currentUser || !creator) return;
    
    // Send initial message
    sendMessage(
      currentUser.id,
      creator.id,
      `Hi! I'm interested in your event: ${event.title}`
    );
    
    // Navigate to messages
    navigate('/messages');
  };
  
  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
              <img 
                src={event.imageUrl || 'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <div className="flex space-x-2 mb-3">
                    <span className="bg-indigo-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {event.category}
                    </span>
                    {event.genderPreference !== 'any' && (
                      <span className="bg-pink-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {event.genderPreference} only
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{event.title}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-white">
                      <MapPin size={16} className="mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-white">
                      <Calendar size={16} className="mr-1" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About This Event</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{event.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar size={18} className="mr-2 text-indigo-600" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p>{formatDate(event.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Clock size={18} className="mr-2 text-indigo-600" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p>{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <MapPin size={18} className="mr-2 text-indigo-600" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p>{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Users size={18} className="mr-2 text-indigo-600" />
                    <div>
                      <p className="font-medium">Group Size</p>
                      <p>{event.participants.length} / {event.maxParticipants} participants</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6">
                  {!isCreator && (
                    <>
                      <button 
                        onClick={handleJoin}
                        disabled={!isParticipant && isFull}
                        className={`flex items-center px-4 py-2 rounded-md font-medium ${
                          isParticipant 
                            ? 'bg-pink-100 text-pink-800 hover:bg-pink-200' 
                            : isFull 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        } transition-colors`}
                      >
                        {isParticipant ? 'Leave Event' : isFull ? 'Event Full' : 'Join Event'}
                      </button>
                      
                      {!isParticipant && !isFull && (
                        <button 
                          onClick={handleInterest}
                          disabled={isInterested}
                          className={`flex items-center px-4 py-2 rounded-md font-medium ${
                            isInterested 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                          } transition-colors`}
                        >
                          <Heart size={18} className="mr-2" fill={isInterested ? 'currentColor' : 'none'} />
                          {isInterested ? 'Interested' : 'Interested'}
                        </button>
                      )}
                    </>
                  )}
                  
                  <button 
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="flex items-center px-4 py-2 rounded-md font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={18} className="mr-2" />
                    Share
                  </button>
                  
                  {!isCreator && (
                    <button 
                      onClick={handleContactCreator}
                      className="flex items-center px-4 py-2 rounded-md font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle size={18} className="mr-2" />
                      Contact Host
                    </button>
                  )}
                  
                  <button 
                    className="flex items-center px-4 py-2 rounded-md font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Flag size={18} className="mr-2" />
                    Report
                  </button>
                </div>
              </div>
            </div>
            
            {/* Participants */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Participants ({participants.length}/{event.maxParticipants})</h2>
                
                {participants.length === 0 ? (
                  <p className="text-gray-600">No participants yet. Be the first to join!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {participants.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {user.photoUrl ? (
                          <img 
                            src={user.photoUrl} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                            <span className="font-semibold text-indigo-600">{user.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.id === event.creatorId ? 'Host' : 'Participant'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Interested Users */}
            {interestedUsers.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Interested ({interestedUsers.length})
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {interestedUsers.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {user.photoUrl ? (
                          <img 
                            src={user.photoUrl} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                            <span className="font-semibold text-indigo-600">{user.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">Interested</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Host Information */}
            {creator && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Event Host</h2>
                  <UserCard user={creator} showInterests={false} />
                </div>
              </div>
            )}
            
            {/* Event Requirements */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Event Requirements</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-800">Gender Preference</p>
                    <p className="text-gray-600">
                      {event.genderPreference === 'any' ? 'Open to all genders' : `${event.genderPreference} only`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-800">Age Range</p>
                    <p className="text-gray-600">{event.ageRange.min} - {event.ageRange.max} years</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-800">Visibility</p>
                    <p className="text-gray-600">{event.visibility === 'public' ? 'Public event' : 'Friends only'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Similar Events */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">You Might Also Like</h2>
                <p className="text-gray-600 text-sm">Find more events in {event.location}</p>
                
                <div className="mt-4">
                  <Link 
                    to="/" 
                    className="block text-indigo-600 hover:text-indigo-800 text-center font-medium"
                  >
                    Explore More Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetailsPage;
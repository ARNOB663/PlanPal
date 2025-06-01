import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Heart } from 'lucide-react';
import { Event, User } from '../../types';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { mockUsers as users } from '../../data/mockData';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { joinEvent, showInterest } = useEvents();
  const { currentUser } = useAuth();
  
  const creator = users.find(user => user.id === event.creatorId);
  const isParticipant = currentUser ? event.participants.includes(currentUser.id) : false;
  const isInterested = currentUser ? event.interestedUsers.includes(currentUser.id) : false;
  const isFull = event.participants.length >= event.maxParticipants;
  
  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentUser && !isParticipant && !isFull) {
      joinEvent(event.id, currentUser.id);
    }
  };
  
  const handleInterest = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentUser && !isParticipant && !isInterested) {
      showInterest(event.id, currentUser.id);
    }
  };
  
  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Link to={`/events/${event.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={event.imageUrl || 'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-white py-1 px-3 rounded-full text-xs font-semibold text-indigo-600 shadow">
            {event.category}
          </div>
        </div>
        
        {/* Event Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
          
          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPin size={16} className="mr-2 text-indigo-500" />
              <span className="text-sm">{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-2 text-indigo-500" />
              <span className="text-sm">{formatDate(event.date)} at {event.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users size={16} className="mr-2 text-indigo-500" />
              <span className="text-sm">
                {event.participants.length}/{event.maxParticipants} participants
              </span>
            </div>
          </div>
          
          {/* Event Preferences */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.genderPreference !== 'any' && (
              <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                {event.genderPreference} only
              </span>
            )}
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Ages {event.ageRange.min}-{event.ageRange.max}
            </span>
          </div>
          
          {/* Creator Info */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center">
              <img 
                src={creator?.photoUrl || 'https://via.placeholder.com/40'} 
                alt={creator?.name || 'Event Creator'}
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
              <span className="text-sm font-medium text-gray-700">
                {creator?.name || 'Anonymous'}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              {currentUser && (
                <>
                  {isParticipant ? (
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Joined
                    </span>
                  ) : isFull ? (
                    <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                      Full
                    </span>
                  ) : (
                    <>
                      <button 
                        onClick={handleJoin}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full transition-colors"
                      >
                        Join
                      </button>
                      <button 
                        onClick={handleInterest}
                        className={`p-1 rounded-full ${isInterested ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                      >
                        <Heart size={16} fill={isInterested ? 'currentColor' : 'none'} />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, MapPin, Calendar } from 'lucide-react';
import { User } from '../../types';

interface UserCardProps {
  user: User;
  showInterests?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, showInterests = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-indigo-800">
        {user.photoUrl ? (
          <img 
            src={user.photoUrl} 
            alt={user.name}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full border-4 border-white object-cover"
          />
        ) : (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full border-4 border-white bg-indigo-200 flex items-center justify-center">
            <UserIcon size={40} className="text-indigo-600" />
          </div>
        )}
      </div>
      
      <div className="pt-16 pb-6 px-4">
        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">{user.name}</h3>
        
        <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
          <MapPin size={16} className="mr-1 text-indigo-500" />
          <span>{user.location}</span>
          <span className="mx-2">•</span>
          <span>{user.age} years</span>
        </div>
        
        {showInterests && (
          <>
            <div className="text-center text-sm text-gray-600 mb-3">
              {user.bio.length > 100 ? user.bio.substring(0, 100) + '...' : user.bio}
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {user.interests.slice(0, 4).map(interest => (
                <span 
                  key={interest}
                  className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
              {user.interests.length > 4 && (
                <span className="text-xs text-gray-500">+{user.interests.length - 4} more</span>
              )}
            </div>
          </>
        )}
        
        <div className="flex justify-center mt-4">
          <Link 
            to={`/profile/${user.id}`}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
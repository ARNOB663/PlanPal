import React from 'react';
import { User, Conversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { mockUsers as users } from '../../data/mockData';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  currentUserId,
  selectedConversationId,
  onSelectConversation
}) => {
  // Get the other user in each conversation
  const getOtherUser = (conversation: Conversation): User | undefined => {
    const otherUserId = conversation.participants.find(id => id !== currentUserId);
    return users.find(user => user.id === otherUserId);
  };
  
  // Format the timestamp to relative time
  const formatTime = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          conversations.map(conversation => {
            const otherUser = getOtherUser(conversation);
            if (!otherUser) return null;
            
            const isSelected = selectedConversationId === conversation.id;
            
            return (
              <div 
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {otherUser.photoUrl ? (
                      <img 
                        src={otherUser.photoUrl} 
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {otherUser.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
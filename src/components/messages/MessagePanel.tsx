import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { Message, User } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { mockUsers as users } from '../../data/mockData';

interface MessagePanelProps {
  messages: Message[];
  currentUserId: string;
  otherUserId: string;
  onSendMessage: (content: string) => void;
  onBack: () => void;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ 
  messages, 
  currentUserId, 
  otherUserId,
  onSendMessage,
  onBack
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUser = users.find(user => user.id === currentUserId);
  const otherUser = users.find(user => user.id === otherUserId);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
  const formatTime = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };
  
  if (!otherUser) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <p className="text-gray-500">No conversation selected</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex items-center space-x-3">
        <button 
          onClick={onBack}
          className="md:hidden p-1 rounded-full hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        
        {otherUser.photoUrl ? (
          <img 
            src={otherUser.photoUrl} 
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">
              {otherUser.name.charAt(0)}
            </span>
          </div>
        )}
        
        <div>
          <h2 className="font-semibold">{otherUser.name}</h2>
          <p className="text-xs text-indigo-200">{otherUser.location}</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            
            return (
              <div 
                key={index}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'} rounded-lg p-3 shadow-sm`}>
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagePanel;
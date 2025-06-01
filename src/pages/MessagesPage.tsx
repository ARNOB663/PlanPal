import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ConversationList from '../components/messages/ConversationList';
import MessagePanel from '../components/messages/MessagePanel';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessageContext';
import { mockUsers as users } from '../data/mockData';

const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { conversations, getUserConversations, getConversationMessages, sendMessage } = useMessages();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  
  const userConversations = currentUser 
    ? getUserConversations(currentUser.id) 
    : [];
  
  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId) 
    : null;
  
  const conversationMessages = selectedConversationId 
    ? getConversationMessages(selectedConversationId) 
    : [];
  
  const otherUserId = selectedConversation 
    ? selectedConversation.participants.find(id => id !== currentUser?.id) 
    : null;
  
  // Show messages panel on larger screens by default
  useEffect(() => {
    const handleResize = () => {
      setShowMessages(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Select first conversation on load if none selected
  useEffect(() => {
    if (userConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(userConversations[0].id);
    }
  }, [userConversations, selectedConversationId]);
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowMessages(true);
  };
  
  const handleSendMessage = (content: string) => {
    if (!currentUser || !otherUserId) return;
    
    sendMessage(currentUser.id, otherUserId, content);
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access messages.</p>
          <a 
            href="/login"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Log In
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[70vh]">
          {/* Conversations List - Always visible on desktop, conditionally on mobile */}
          <div className={`md:col-span-1 ${showMessages ? 'hidden md:block' : 'block'}`}>
            <ConversationList 
              conversations={userConversations}
              currentUserId={currentUser.id}
              selectedConversationId={selectedConversationId || ''}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          
          {/* Message Panel - Conditionally visible */}
          <div className={`md:col-span-2 h-[70vh] ${showMessages ? 'block' : 'hidden md:block'}`}>
            {selectedConversationId && otherUserId ? (
              <MessagePanel 
                messages={conversationMessages}
                currentUserId={currentUser.id}
                otherUserId={otherUserId}
                onSendMessage={handleSendMessage}
                onBack={() => setShowMessages(false)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md h-full flex flex-col justify-center items-center p-6">
                <div className="text-center max-w-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Conversation Selected</h3>
                  <p className="text-gray-600 mb-6">Select a conversation to start messaging.</p>
                  
                  {userConversations.length === 0 && (
                    <div>
                      <p className="text-gray-600 mb-4">You don't have any conversations yet.</p>
                      <a 
                        href="/"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        Find Events to Connect
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
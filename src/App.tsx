import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { MessageProvider } from './context/MessageContext';

import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import CreateEventPage from './pages/CreateEventPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import { LoginPage, SignupPage } from './pages/AuthPages';

import { useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// App Component
const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route 
        path="/create-event" 
        element={
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route path="/profile/:id" element={<ProfilePage />} />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
};

// Root App Component with Providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <MessageProvider>
            <AppContent />
          </MessageProvider>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
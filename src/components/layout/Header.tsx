import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Search, Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-md fixed w-full top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold flex items-center space-x-2">
            <span className="text-teal-300">Meet</span>
            <span>Buddy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-teal-300 transition-colors">Home</Link>
            <Link to="/create-event" className="hover:text-teal-300 transition-colors">Create Event</Link>
            <Link to="/messages" className="hover:text-teal-300 transition-colors">Messages</Link>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/messages\" className="relative p-2 rounded-full hover:bg-indigo-700 transition-colors">
                  <MessageCircle size={20} />
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </Link>
                <Link to="/notifications" className="relative p-2 rounded-full hover:bg-indigo-700 transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
                </Link>
                <div className="relative group">
                  <Link to="/profile" className="flex items-center space-x-2">
                    {currentUser?.photoUrl ? (
                      <img 
                        src={currentUser.photoUrl} 
                        alt={currentUser.name} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-teal-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                    <span className="font-medium">{currentUser?.name?.split(' ')[0]}</span>
                  </Link>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-100">Settings</Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-teal-300 transition-colors">Login</Link>
                <Link 
                  to="/signup" 
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-indigo-700 transition-colors"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-indigo-500 mt-3">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="p-2 hover:bg-indigo-700 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/create-event" 
                className="p-2 hover:bg-indigo-700 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Event
              </Link>
              <Link 
                to="/messages" 
                className="p-2 hover:bg-indigo-700 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className="p-2 hover:bg-indigo-700 rounded-md transition-colors flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {currentUser?.photoUrl ? (
                      <img 
                        src={currentUser.photoUrl} 
                        alt={currentUser.name} 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} />
                    )}
                    <span>Profile</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    className="p-2 hover:bg-indigo-700 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-left p-2 hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="p-2 hover:bg-indigo-700 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
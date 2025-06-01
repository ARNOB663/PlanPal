import React, { useState } from 'react';
import { BellRing, Shield, Eye, Users, Lock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [settings, setSettings] = useState({
    defaultVisibility: 'public',
    notifyNewMessage: true,
    notifyEventRequest: true,
    notifyEventUpdates: true,
    blockDirectMessages: false,
    hideProfile: false,
    hideLocation: false,
    blockUnknownUsers: false,
    twoFactorAuth: false
  });
  
  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleSelectChange = (setting: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access settings.</p>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="divide-y divide-gray-200">
                <a 
                  href="#privacy" 
                  className="block px-6 py-4 text-indigo-600 font-medium border-l-4 border-indigo-600 bg-indigo-50"
                >
                  Privacy Settings
                </a>
                <a 
                  href="#notifications" 
                  className="block px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Notification Preferences
                </a>
                <a 
                  href="#account" 
                  className="block px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Account Security
                </a>
                <a 
                  href="#profile" 
                  className="block px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Profile Settings
                </a>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Privacy Settings */}
            <section id="privacy" className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 bg-indigo-600 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <Eye size={20} className="mr-2" />
                  Privacy Settings
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="defaultVisibility" className="block text-sm font-medium text-gray-700 mb-2">
                    Default Event Visibility
                  </label>
                  <select
                    id="defaultVisibility"
                    value={settings.defaultVisibility}
                    onChange={(e) => handleSelectChange('defaultVisibility', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private (Invitation Only)</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    This will be the default visibility setting when you create new events.
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Hide Location</h3>
                    <p className="text-sm text-gray-500">Hide your exact location from your profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.hideLocation}
                      onChange={() => handleToggle('hideLocation')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Hide Profile from Search</h3>
                    <p className="text-sm text-gray-500">Your profile won't appear in search results</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.hideProfile}
                      onChange={() => handleToggle('hideProfile')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Block Direct Messages</h3>
                    <p className="text-sm text-gray-500">Only receive messages from people you follow</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.blockDirectMessages}
                      onChange={() => handleToggle('blockDirectMessages')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </section>
            
            {/* Notification Settings */}
            <section id="notifications" className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 bg-indigo-600 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <BellRing size={20} className="mr-2" />
                  Notification Preferences
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">New Messages</h3>
                    <p className="text-sm text-gray-500">Get notified when you receive a new message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.notifyNewMessage}
                      onChange={() => handleToggle('notifyNewMessage')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Event Join Requests</h3>
                    <p className="text-sm text-gray-500">Get notified when someone wants to join your event</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.notifyEventRequest}
                      onChange={() => handleToggle('notifyEventRequest')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Event Updates</h3>
                    <p className="text-sm text-gray-500">Get notified about changes to events you've joined</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.notifyEventUpdates}
                      onChange={() => handleToggle('notifyEventUpdates')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </section>
            
            {/* Security Settings */}
            <section id="account" className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 bg-indigo-600 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <Shield size={20} className="mr-2" />
                  Account Security
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.twoFactorAuth}
                      onChange={() => handleToggle('twoFactorAuth')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Block Unknown Users</h3>
                    <p className="text-sm text-gray-500">Only allow interactions from verified users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.blockUnknownUsers}
                      onChange={() => handleToggle('blockUnknownUsers')}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="mt-8">
                  <button className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Reset Password
                  </button>
                  <button className="ml-4 text-gray-600 hover:text-gray-800 font-medium py-2 px-4 rounded-md transition-colors">
                    Manage Blocked Users
                  </button>
                </div>
              </div>
            </section>
            
            {/* Save Changes */}
            <div className="flex justify-end">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors mr-4">
                Cancel
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
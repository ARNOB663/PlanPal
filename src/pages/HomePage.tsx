import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Layout from '../components/layout/Layout';
import EventCard from '../components/events/EventCard';
import EventFilter from '../components/events/EventFilter';
import { useEvents } from '../context/EventContext';

const HomePage: React.FC = () => {
  const { filteredEvents, filterOptions, setFilterOptions } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedEvents, setDisplayedEvents] = useState(filteredEvents);
  
  useEffect(() => {
    if (searchTerm.trim()) {
      const searchResults = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedEvents(searchResults);
    } else {
      setDisplayedEvents(filteredEvents);
    }
  }, [searchTerm, filteredEvents]);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 px-6 py-16 md:py-24 md:px-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Never Miss an Experience Again
            </h1>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl">
              Find companions for events, trips, and activities. Connect with like-minded people and create memorable experiences together.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={20} className="text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events by title, description, or location..." 
                  className="w-full py-3 pl-10 pr-4 bg-white text-gray-800 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <EventFilter 
              filterOptions={filterOptions}
              setFilterOptions={setFilterOptions}
            />
          </div>
          
          {/* Event Cards */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {displayedEvents.length} {displayedEvents.length === 1 ? 'Event' : 'Events'} Found
              </h2>
            </div>
            
            {displayedEvents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find events.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
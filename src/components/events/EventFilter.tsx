import React, { useState } from 'react';
import { FilterOptions } from '../../types';
import { Filter, X, ChevronDown } from 'lucide-react';
import { mockEvents as events } from '../../data/mockData';

interface EventFilterProps {
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
}

const EventFilter: React.FC<EventFilterProps> = ({ filterOptions, setFilterOptions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract unique categories from events
  const categories = Array.from(new Set(events.map(event => event.category)));
  
  // Extract unique locations from events
  const locations = Array.from(new Set(events.map(event => event.location)));
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions({ ...filterOptions, category: e.target.value });
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions({ ...filterOptions, location: e.target.value });
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions({ ...filterOptions, date: e.target.value });
  };
  
  const handleGenderPreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions({ 
      ...filterOptions, 
      genderPreference: e.target.value as 'female' | 'male' | 'any' | '' 
    });
  };
  
  const handleMinAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minAge = parseInt(e.target.value);
    setFilterOptions({ 
      ...filterOptions, 
      ageRange: { 
        ...filterOptions.ageRange, 
        min: minAge 
      } 
    });
  };
  
  const handleMaxAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxAge = parseInt(e.target.value);
    setFilterOptions({ 
      ...filterOptions, 
      ageRange: { 
        ...filterOptions.ageRange, 
        max: maxAge 
      } 
    });
  };
  
  const resetFilters = () => {
    setFilterOptions({
      category: '',
      location: '',
      date: '',
      genderPreference: '',
      ageRange: { min: 18, max: 65 }
    });
  };
  
  const hasActiveFilters = 
    filterOptions.category !== '' || 
    filterOptions.location !== '' || 
    filterOptions.date !== '' || 
    filterOptions.genderPreference !== '' ||
    filterOptions.ageRange.min !== 18 ||
    filterOptions.ageRange.max !== 65;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Filter size={18} className="text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          {hasActiveFilters && (
            <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-indigo-600 flex items-center"
            >
              <X size={14} className="mr-1" />
              Clear all
            </button>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
          >
            {isExpanded ? 'Collapse' : 'Expand'} 
            <ChevronDown 
              size={16} 
              className={`ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>
      </div>
      
      {/* Quick Filters - Always Visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={filterOptions.category}
            onChange={handleCategoryChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="location"
            value={filterOptions.location}
            onChange={handleLocationChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={filterOptions.date}
            onChange={handleDateChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      
      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <label htmlFor="genderPreference" className="block text-sm font-medium text-gray-700 mb-1">
              Gender Preference
            </label>
            <select
              id="genderPreference"
              value={filterOptions.genderPreference}
              onChange={handleGenderPreferenceChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Any</option>
              <option value="female">Female Only</option>
              <option value="male">Male Only</option>
              <option value="any">Open to All</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="minAge" className="block text-sm font-medium text-gray-700 mb-1">
              Min Age
            </label>
            <input
              type="number"
              id="minAge"
              min="18"
              max="65"
              value={filterOptions.ageRange.min}
              onChange={handleMinAgeChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label htmlFor="maxAge" className="block text-sm font-medium text-gray-700 mb-1">
              Max Age
            </label>
            <input
              type="number"
              id="maxAge"
              min="18"
              max="100"
              value={filterOptions.ageRange.max}
              onChange={handleMaxAgeChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFilter;
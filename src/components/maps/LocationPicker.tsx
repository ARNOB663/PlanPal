import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  defaultLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const handleLocationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const address = formData.get('location') as string;
    
    // Since we're not using Google Maps anymore, we'll use placeholder coordinates
    onLocationSelect({
      address,
      lat: 0,
      lng: 0
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleLocationSubmit} className="space-y-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Event Location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter event location"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </form>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-sm text-gray-600">
          Enter a detailed address or location description to help attendees find your event.
        </p>
      </div>
    </div>
  );
};

export default LocationPicker;
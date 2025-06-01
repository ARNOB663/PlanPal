import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, FileText, Tag, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { Event } from '../../types';
import LocationPicker from '../maps/LocationPicker';
import PhotoUpload from '../media/PhotoUpload';

const categories = ['Concert', 'Sports', 'Party', 'Conference', 'Workshop', 'Other'] as const;

const EventForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { addEvent } = useEvents();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    coordinates: {
      lat: 0,
      lng: 0
    },
    maxParticipants: 5,
    genderPreference: 'any',
    ageRange: { min: 18, max: 65 },
    category: 'Concert' as typeof categories[number],
    visibility: 'public',
    photos: [] as string[],
    taggedUsers: [] as string[],
    venue: {
      name: '',
      address: '',
      parking: '',
      transit: ''
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'minAge' || name === 'maxAge') {
      setFormData(prev => ({
        ...prev,
        ageRange: {
          ...prev.ageRange,
          [name === 'minAge' ? 'min' : 'max']: parseInt(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      coordinates: {
        lat: location.lat,
        lng: location.lng
      },
      venue: {
        ...prev.venue,
        address: location.address
      }
    }));
  };

  const handlePhotoSelect = (files: File[]) => {
    // In a real app, we would upload these files to a server
    // For now, we'll create local URLs
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setSelectedPhotos(prev => [...prev, ...newPhotos]);
  };

  const handlePhotoRemove = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.maxParticipants < 2) {
      newErrors.maxParticipants = 'At least 2 participants required';
    }
    
    if (formData.ageRange.min >= formData.ageRange.max) {
      newErrors.ageRange = 'Min age must be less than max age';
    }

    if (selectedPhotos.length === 0) {
      newErrors.photos = 'At least one photo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    // Create new event object
    const newEvent: Event = {
      id: `event${Date.now()}`,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      coordinates: formData.coordinates,
      creatorId: currentUser.id,
      maxParticipants: formData.maxParticipants,
      participants: [currentUser.id],
      interestedUsers: [],
      genderPreference: formData.genderPreference as 'female' | 'male' | 'any',
      ageRange: formData.ageRange,
      category: formData.category,
      visibility: formData.visibility as 'public' | 'friends',
      imageUrl: selectedPhotos[0],
      photos: selectedPhotos,
      taggedUsers: formData.taggedUsers,
      venue: formData.venue
    };
    
    // Add the event and navigate to its page
    addEvent(newEvent);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/events/${newEvent.id}`);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a New Event</h2>
      
      {/* Basic Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <FileText size={18} className="mr-2 text-indigo-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your event a descriptive title"
              className={`w-full rounded-md ${errors.title ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what the event is about, what to expect, etc."
              className={`w-full rounded-md ${errors.description ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Tag size={16} className="text-gray-500" />
              </div>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="venue.name" className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name
            </label>
            <input
              type="text"
              id="venue.name"
              name="venue.name"
              value={formData.venue.name}
              onChange={handleChange}
              placeholder="Name of the venue"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
      
      {/* Location Picker */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <MapPin size={18} className="mr-2 text-indigo-600" />
          Location
        </h3>
        
        <LocationPicker onLocationSelect={handleLocationSelect} />
        
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label htmlFor="venue.parking" className="block text-sm font-medium text-gray-700 mb-1">
              Parking Information
            </label>
            <input
              type="text"
              id="venue.parking"
              name="venue.parking"
              value={formData.venue.parking}
              onChange={handleChange}
              placeholder="Available parking options"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label htmlFor="venue.transit" className="block text-sm font-medium text-gray-700 mb-1">
              Public Transit
            </label>
            <input
              type="text"
              id="venue.transit"
              name="venue.transit"
              value={formData.venue.transit}
              onChange={handleChange}
              placeholder="Nearby public transportation"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
      
      {/* Date and Time */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <Calendar size={18} className="mr-2 text-indigo-600" />
          Date and Time
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar size={16} className="text-gray-500" />
              </div>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full pl-10 rounded-md ${errors.date ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
              />
            </div>
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Clock size={16} className="text-gray-500" />
              </div>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full pl-10 rounded-md ${errors.time ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
              />
            </div>
            {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
          </div>
        </div>
      </div>
      
      {/* Photos */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <ImageIcon size={18} className="mr-2 text-indigo-600" />
          Event Photos
        </h3>
        
        <PhotoUpload
          onPhotosSelected={handlePhotoSelect}
          maxFiles={5}
          selectedPhotos={selectedPhotos}
          onPhotoRemove={handlePhotoRemove}
        />
        
        {errors.photos && <p className="mt-1 text-sm text-red-600">{errors.photos}</p>}
      </div>
      
      {/* Preferences */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <Users size={18} className="mr-2 text-indigo-600" />
          Preferences and Requirements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Participants*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Users size={16} className="text-gray-500" />
              </div>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                min="2"
                max="50"
                value={formData.maxParticipants}
                onChange={handleChange}
                className={`w-full pl-10 rounded-md ${errors.maxParticipants ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
              />
            </div>
            {errors.maxParticipants && <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>}
          </div>
          
          <div>
            <label htmlFor="genderPreference" className="block text-sm font-medium text-gray-700 mb-1">
              Gender Preference
            </label>
            <select
              id="genderPreference"
              name="genderPreference"
              value={formData.genderPreference}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="any">All Genders Welcome</option>
              <option value="female">Female Only</option>
              <option value="male">Male Only</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
            
            </select>
          </div>
          
          <div>
            <label htmlFor="minAge" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Age
            </label>
            <input
              type="number"
              id="minAge"
              name="minAge"
              min="18"
              max="65"
              value={formData.ageRange.min}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label htmlFor="maxAge" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Age
            </label>
            <input
              type="number"
              id="maxAge"
              name="maxAge"
              min="18"
              max="100"
              value={formData.ageRange.max}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        {errors.ageRange && <p className="mt-2 text-sm text-red-600">{errors.ageRange}</p>}
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button 
          type="submit"
          disabled={isSubmitting}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md shadow-sm transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Creating Event...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
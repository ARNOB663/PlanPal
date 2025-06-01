import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Event, FilterOptions, ParticipationRequest } from '../types';
import { mockEvents } from '../data/mockData';

interface EventContextType {
  events: Event[];
  filteredEvents: Event[];
  filterOptions: FilterOptions;
  participationRequests: ParticipationRequest[];
  setFilterOptions: (options: FilterOptions) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  requestToJoin: (eventId: string, userId: string, message?: string) => void;
  approveParticipant: (eventId: string, userId: string) => void;
  rejectParticipant: (eventId: string, userId: string) => void;
  leaveEvent: (eventId: string, userId: string) => void;
  showInterest: (eventId: string, userId: string) => void;
  getEventById: (id: string) => Event | undefined;
  getPendingRequests: (eventId: string) => ParticipationRequest[];
}

const defaultFilterOptions: FilterOptions = {
  category: '',
  location: '',
  date: '',
  genderPreference: '',
  ageRange: { min: 18, max: 65 },
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(defaultFilterOptions);
  const [participationRequests, setParticipationRequests] = useState<ParticipationRequest[]>([]);

  const filteredEvents = events.filter(event => {
    if (filterOptions.category && event.category !== filterOptions.category) {
      return false;
    }
    
    if (filterOptions.location && !event.location.toLowerCase().includes(filterOptions.location.toLowerCase())) {
      return false;
    }
    
    if (filterOptions.date && event.date !== filterOptions.date) {
      return false;
    }
    
    if (filterOptions.genderPreference && 
        filterOptions.genderPreference !== 'any' && 
        event.genderPreference !== 'any' && 
        event.genderPreference !== filterOptions.genderPreference) {
      return false;
    }
    
    const minAgeSpecified = filterOptions.ageRange.min !== defaultFilterOptions.ageRange.min;
    const maxAgeSpecified = filterOptions.ageRange.max !== defaultFilterOptions.ageRange.max;
    
    if (minAgeSpecified && event.ageRange.min < filterOptions.ageRange.min) {
      return false;
    }
    
    if (maxAgeSpecified && event.ageRange.max > filterOptions.ageRange.max) {
      return false;
    }
    
    return true;
  });

  const addEvent = (event: Event) => {
    setEvents(prevEvents => [...prevEvents, event]);
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const requestToJoin = (eventId: string, userId: string, message?: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Add user to pending participants
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            pendingParticipants: [...event.pendingParticipants, userId]
          };
        }
        return event;
      })
    );

    // Create participation request
    const request: ParticipationRequest = {
      id: `req${Date.now()}`,
      eventId,
      userId,
      status: 'pending',
      timestamp: new Date().toISOString(),
      message
    };

    setParticipationRequests(prev => [...prev, request]);
  };

  const approveParticipant = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            participants: [...event.participants, userId],
            pendingParticipants: event.pendingParticipants.filter(id => id !== userId),
            interestedUsers: event.interestedUsers.filter(id => id !== userId)
          };
        }
        return event;
      })
    );

    setParticipationRequests(prev =>
      prev.map(request => {
        if (request.eventId === eventId && request.userId === userId) {
          return { ...request, status: 'approved' };
        }
        return request;
      })
    );
  };

  const rejectParticipant = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            pendingParticipants: event.pendingParticipants.filter(id => id !== userId)
          };
        }
        return event;
      })
    );

    setParticipationRequests(prev =>
      prev.map(request => {
        if (request.eventId === eventId && request.userId === userId) {
          return { ...request, status: 'rejected' };
        }
        return request;
      })
    );
  };

  const leaveEvent = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            participants: event.participants.filter(id => id !== userId)
          };
        }
        return event;
      })
    );
  };

  const showInterest = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === eventId && !event.interestedUsers.includes(userId) && !event.participants.includes(userId)) {
          return {
            ...event,
            interestedUsers: [...event.interestedUsers, userId]
          };
        }
        return event;
      })
    );
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  const getPendingRequests = (eventId: string) => {
    return participationRequests.filter(
      request => request.eventId === eventId && request.status === 'pending'
    );
  };

  return (
    <EventContext.Provider 
      value={{ 
        events, 
        filteredEvents,
        filterOptions, 
        participationRequests,
        setFilterOptions,
        addEvent, 
        updateEvent, 
        requestToJoin,
        approveParticipant,
        rejectParticipant,
        leaveEvent, 
        showInterest,
        getEventById,
        getPendingRequests
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
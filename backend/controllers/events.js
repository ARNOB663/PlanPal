import Event from '../models/Event.js';
import User from '../models/User.js'; // For potential population, not strictly used in basic functions below
import { validationResult } from 'express-validator';

// Create new event
export const createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, date, time, location, coordinates, category, maxParticipants, ageRange, visibility, imageUrl, photos, venue, genderPreference } = req.body;

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      coordinates,
      category,
      maxParticipants,
      ageRange,
      visibility,
      imageUrl,
      photos,
      venue,
      genderPreference,
      creator: req.user.id, 
    });

    const savedEvent = await newEvent.save();
    // Populate creator info for the response
    const populatedEvent = await Event.findById(savedEvent._id).populate('creator', 'name email photoUrl');
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    // Check for Mongoose validation error
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('creator', 'name email photoUrl').sort({ date: -1 }); // Sort by newest first
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('creator', 'name email photoUrl').populate('participants', 'name email photoUrl');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user is the creator of the event
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this event' });
    }

    // Update fields
    const { title, description, date, time, location, coordinates, category, maxParticipants, ageRange, visibility, imageUrl, photos, venue, genderPreference } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    if (coordinates) { // Handle coordinates update carefully
        event.coordinates.lat = coordinates.lat !== undefined ? coordinates.lat : event.coordinates.lat;
        event.coordinates.lng = coordinates.lng !== undefined ? coordinates.lng : event.coordinates.lng;
    }
    event.category = category || event.category;
    event.maxParticipants = maxParticipants || event.maxParticipants;
    if (ageRange) { // Handle ageRange update carefully
        event.ageRange.min = ageRange.min !== undefined ? ageRange.min : event.ageRange.min;
        event.ageRange.max = ageRange.max !== undefined ? ageRange.max : event.ageRange.max;
    }
    event.visibility = visibility || event.visibility;
    event.imageUrl = imageUrl || event.imageUrl;
    event.photos = photos || event.photos;
    if (venue) {
        event.venue.name = venue.name || event.venue.name;
        event.venue.address = venue.address || event.venue.address;
        // Add other venue fields as necessary
    }
    event.genderPreference = genderPreference || event.genderPreference;


    const updatedEvent = await event.save();
    const populatedEvent = await Event.findById(updatedEvent._id).populate('creator', 'name email photoUrl');
    res.status(200).json(populatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
     if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user is the creator of the event
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id); // Corrected: Use findByIdAndDelete
    res.status(200).json({ message: 'Event successfully deleted' }); // Or 204 No Content
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

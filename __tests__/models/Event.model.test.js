import Event from '../../backend/models/Event.js';
import User from '../../backend/models/User.js';
import mongoose from 'mongoose';

describe('Event Model', () => {
  let dummyUser;

  beforeEach(async () => { // Changed from beforeAll to beforeEach
    // Setup a dummy user
    const userData = {
      name: 'Event Creator',
      // Use unique email for each test run in beforeEach to avoid conflicts if not cleaned perfectly
      email: `eventcreator-${Date.now()}@example.com`,
      password: 'password123',
      gender: 'male',
      age: 30,
    };
    dummyUser = new User(userData);
    await dummyUser.save();
  });

  afterEach(async () => { // Changed from afterAll to afterEach
    // Clean up the dummy user
    if (dummyUser) { // Ensure dummyUser exists before trying to delete
        await User.findByIdAndDelete(dummyUser._id);
        dummyUser = null; // Reset for next test
    }
    // Also clear Events created in tests, setup.js beforeEach might already do this
    await Event.deleteMany({});
  });

  // Test successful event creation
  it('should create an event successfully with valid data', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'This is a test event.',
      date: new Date(),
      time: '10:00 AM',
      location: 'Test Location String',
      coordinates: {
        lat: 12.34,
        lng: 56.78,
      },
      creator: dummyUser._id,
      maxParticipants: 10,
      ageRange: {
        min: 18,
        max: 99,
      },
      category: 'Concert',
    };
    const event = new Event(eventData);
    const savedEvent = await event.save();

    expect(savedEvent).not.toBeNull();
    expect(savedEvent._id).toBeDefined();
    expect(savedEvent.title).toBe(eventData.title);
    expect(savedEvent.description).toBe(eventData.description);
    expect(savedEvent.location).toBe(eventData.location);
    expect(savedEvent.coordinates.lat).toBe(eventData.coordinates.lat);
    expect(savedEvent.coordinates.lng).toBe(eventData.coordinates.lng);
    expect(savedEvent.creator.toString()).toBe(dummyUser._id.toString());
    expect(savedEvent.maxParticipants).toBe(eventData.maxParticipants);
    expect(savedEvent.ageRange.min).toBe(eventData.ageRange.min);
    expect(savedEvent.ageRange.max).toBe(eventData.ageRange.max);
    expect(savedEvent.category).toBe(eventData.category);
  });

  // Test population of creator field
  it('should populate the creator field', async () => {
    const eventData = {
      title: 'Event to Populate Creator',
      description: 'Testing population.',
      date: new Date(),
      time: '11:00 AM',
      location: 'Population Test Location',
      creator: dummyUser._id,
      maxParticipants: 5,
      ageRange: {
        min: 20,
        max: 50,
      },
      category: 'Workshop',
    };
    const event = new Event(eventData);
    await event.save();

    const foundEvent = await Event.findById(event._id).populate('creator');

    expect(foundEvent.creator).toBeInstanceOf(Object);
    expect(foundEvent.creator.name).toBe(dummyUser.name);
    expect(foundEvent.creator.email).toBe(dummyUser.email);
  });

  // Test required fields
  it('should fail if required fields are missing', async () => {
    const baseEventData = {
      title: 'Incomplete Event',
      description: 'Missing some fields.',
      date: new Date(),
      time: '12:00 PM',
      location: 'Required Test Location',
      creator: dummyUser._id,
      maxParticipants: 20,
      ageRange: {
        min: 21,
        max: 45,
      },
      category: 'Party',
    };

    const requiredFields = ['title', 'description', 'date', 'time', 'location', 'creator', 'maxParticipants', 'category'];
    // Special handling for nested required fields like ageRange.min and ageRange.max
    const requiredAgeRangeFields = ['ageRange.min', 'ageRange.max'];

    for (const field of requiredFields) {
      const eventData = { ...baseEventData };
      delete eventData[field];

      const event = new Event(eventData);
      try {
        await event.save();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.errors[field].kind).toBe('required');
      }
    }

    for (const field of requiredAgeRangeFields) {
      const eventData = JSON.parse(JSON.stringify(baseEventData)); // Deep copy
      if (field === 'ageRange.min') {
        delete eventData.ageRange.min;
      } else if (field === 'ageRange.max') {
        delete eventData.ageRange.max;
      }

      const event = new Event(eventData);
      try {
        await event.save();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // For nested fields, the error path might be different
        expect(error.errors[field] || error.errors['ageRange.min'] || error.errors['ageRange.max']).toBeDefined();
        if (error.errors[field]) {
           expect(error.errors[field].kind).toBe('required');
        } else if (field === 'ageRange.min' && error.errors['ageRange.min']) {
           expect(error.errors['ageRange.min'].kind).toBe('required');
        } else if (field === 'ageRange.max' && error.errors['ageRange.max']) {
           expect(error.errors['ageRange.max'].kind).toBe('required');
        }
      }
    }
  });

  // Test coordinates schema (not GeoJSON as per actual model)
  // This test is more about ensuring that if coordinates are provided, they are stored,
  // as 'lat' and 'lng' are not strictly required by the schema.
  it('should correctly store latitude and longitude if provided', async () => {
    const eventData = {
      title: 'Event with Coords',
      description: 'Testing coordinates storage.',
      date: new Date(),
      time: '01:00 PM',
      location: 'Coords Test Location',
      coordinates: {
        lat: 77.77,
        lng: 88.88,
      },
      creator: dummyUser._id,
      maxParticipants: 15,
      ageRange: {
        min: 25,
        max: 55,
      },
      category: 'Sports',
    };
    const event = new Event(eventData);
    const savedEvent = await event.save();

    expect(savedEvent.coordinates).toBeDefined();
    expect(savedEvent.coordinates.lat).toBe(77.77);
    expect(savedEvent.coordinates.lng).toBe(88.88);
  });

  it('should allow creating an event without coordinates', async () => {
    const eventData = {
      title: 'Event without Coords',
      description: 'Testing null coordinates.',
      date: new Date(),
      time: '02:00 PM',
      location: 'No Coords Test Location',
      // coordinates field is omitted
      creator: dummyUser._id,
      maxParticipants: 12,
      ageRange: {
        min: 19,
        max: 60,
      },
      category: 'Other',
    };
    const event = new Event(eventData);
    const savedEvent = await event.save();

    // Mongoose might initialize an empty nested object if not explicitly undefined in schema/options
    expect(savedEvent.coordinates).toEqual({});
  });
});

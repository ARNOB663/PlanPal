process.env.JWT_SECRET = 'testsecret'; // Define this at the very top

import request from 'supertest';
import app from '../../../backend/server.js';
import Event from '../../../backend/models/Event.js';
import User from '../../../backend/models/User.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

describe('Event Routes (/api/events)', () => {
  let user1, user2, token1, token2;
  // User data needs to be unique for each test run if created in beforeEach
  const getUserData1 = () => ({ name: 'User One', email: `user1-${Date.now()}@example.com`, password: 'password123', age: 30, gender: 'male', interests: ['hiking'] });
  const getUserData2 = () => ({ name: 'User Two', email: `user2-${Date.now()}@example.com`, password: 'password123', age: 28, gender: 'female', interests: ['coding'] });

  const commonEventData = {
    title: 'Test Event',
    description: 'This is a test description.',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    time: '18:00',
    location: 'Test Location, Test City',
    category: 'Workshop',
    maxParticipants: 20,
    ageRange: { min: 18, max: 99 },
    coordinates: { lat: 12.345, lng: -67.890 },
    genderPreference: 'any',
    visibility: 'public'
  };

  beforeEach(async () => { // Changed from beforeAll
    // Create users
    user1 = await new User(getUserData1()).save();
    user2 = await new User(getUserData2()).save();

    // Generate tokens
    token1 = jwt.sign({ userId: user1._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    token2 = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => {
    // Users are cleared by global beforeEach in setup.js, but specific event cleanup is good.
    await Event.deleteMany({});
    // Explicitly delete users created in this beforeEach to be safe, though setup.js should also handle it.
    if (user1) await User.findByIdAndDelete(user1._id);
    if (user2) await User.findByIdAndDelete(user2._id);
  });

  // afterAll for mongoose.connection.close() should be handled by __tests__/setup.js
  // No specific afterAll needed here unless it's for something unique to this file.

  // Test POST /api/events (Create Event)
  describe('POST /api/events', () => {
    it('should create an event successfully with valid data and token', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token1}`)
        .send(commonEventData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBe(commonEventData.title);
      expect(res.body.creator._id.toString()).toBe(user1._id.toString());
      const dbEvent = await Event.findById(res.body._id);
      expect(dbEvent).toBeTruthy();
      expect(dbEvent.location).toBe(commonEventData.location);
    });

    it('should fail to create an event without a token', async () => {
      const res = await request(app).post('/api/events').send(commonEventData);
      expect(res.statusCode).toEqual(401); // Assuming protect middleware sends 401
    });

    it('should fail with validation errors for missing required fields (e.g., title)', async () => {
      const { title, ...eventDataWithoutTitle } = commonEventData;
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token1}`)
        .send(eventDataWithoutTitle);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(err => err.path === 'title' || (err.param === 'title' && err.location === 'body'))).toBe(true); // express-validator v6 vs v7
    });
  });

  // Test GET /api/events (Get All Events)
  describe('GET /api/events', () => {
    it('should get all events', async () => {
      await new Event({ ...commonEventData, title: 'Event One', creator: user1._id }).save();
      await new Event({ ...commonEventData, title: 'Event Two', creator: user2._id }).save();

      const res = await request(app).get('/api/events');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  // Test GET /api/events/:id (Get Single Event)
  describe('GET /api/events/:id', () => {
    let createdEvent;
    beforeEach(async () => {
        createdEvent = await new Event({ ...commonEventData, creator: user1._id }).save();
    });

    it('should get a single event by its ID', async () => {
      const res = await request(app).get(`/api/events/${createdEvent._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toBe(createdEvent.title);
      expect(res.body.creator._id.toString()).toBe(user1._id.toString());
    });

    it('should return 404 if event not found (valid ID format)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/events/${fakeId}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 or 404 for invalid event ID format', async () => {
      // My controller for getEventById has specific check for ObjectId, returns 404 for invalid format
      // The express-validator on routes would return 400 if param('id').isMongoId() was used there.
      // For now, assuming controller handles it directly.
      const res = await request(app).get('/api/events/invalidID');
      expect(res.statusCode).toEqual(404); // Based on current controller logic
      expect(res.body.message).toContain('invalid ID format');
    });
  });

  // Test PUT /api/events/:id (Update Event)
  describe('PUT /api/events/:id', () => {
    let eventToUpdate;
    // Define a base for updates, ensuring all required fields are present
    let fullEventDataForUpdate;

    beforeEach(async () => {
        // Create a full event object based on commonEventData for updates
        fullEventDataForUpdate = {
            ...commonEventData, // Spread common fields
            title: 'Original Title for Update Test',
            description: 'Original Description',
            // Ensure all required fields from commonEventData are here or add defaults
            date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Ensure date is valid
            time: commonEventData.time || '10:00',
            location: commonEventData.location || 'Default Location',
            category: commonEventData.category || 'Other',
            maxParticipants: commonEventData.maxParticipants || 10,
            ageRange: commonEventData.ageRange || { min: 18, max: 99 },
        };
        eventToUpdate = await new Event({ ...fullEventDataForUpdate, creator: user1._id }).save();
    });

    it('should update an event successfully if user is the creator', async () => {
      const specificUpdates = { title: 'Updated Super Title', description: 'Updated description here.' };
      const payload = { ...fullEventDataForUpdate, ...specificUpdates, _id: undefined, creator: undefined }; // Send full data with updates
      const res = await request(app)
        .put(`/api/events/${eventToUpdate._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send(payload);
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toBe(specificUpdates.title);
      expect(res.body.description).toBe(specificUpdates.description);
    });

    it('should fail to update if user is not the creator', async () => {
      const specificUpdates = { title: 'Attempted Update By NonCreator' };
      const payload = { ...fullEventDataForUpdate, ...specificUpdates, _id: undefined, creator: undefined };
      const res = await request(app)
        .put(`/api/events/${eventToUpdate._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send(payload);
      expect(res.statusCode).toEqual(403);
    });

    it('should fail to update without a token', async () => {
      const specificUpdates = { title: 'Attempted Update No Token' };
      const payload = { ...fullEventDataForUpdate, ...specificUpdates, _id: undefined, creator: undefined };
      const res = await request(app)
        .put(`/api/events/${eventToUpdate._id}`)
        .send(payload);
      expect(res.statusCode).toEqual(401);
    });

    it('should return 404 if event to update not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const specificUpdates = { title: 'Attempted Update Fake ID' };
      const payload = { ...fullEventDataForUpdate, ...specificUpdates, _id: undefined, creator: undefined };
      const res = await request(app)
        .put(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send(payload);
      expect(res.statusCode).toEqual(404);
    });

    it('should fail with validation errors for invalid update data (e.g. empty title)', async () => {
      // Send the full data but with an invalid title
      const payload = { ...fullEventDataForUpdate, title: '', _id: undefined, creator: undefined };
      const res = await request(app)
        .put(`/api/events/${eventToUpdate._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send(payload);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(err => err.path === 'title' || (err.param === 'title' && err.location === 'body'))).toBe(true);
    });
  });

  // Test DELETE /api/events/:id (Delete Event)
  describe('DELETE /api/events/:id', () => {
    let eventToDelete;
    beforeEach(async () => {
        eventToDelete = await new Event({ ...commonEventData, creator: user1._id }).save();
    });

    it('should delete an event successfully if user is the creator', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventToDelete._id}`)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toEqual(200); // Controller returns 200 with message
      expect(res.body.message).toBe('Event successfully deleted');
      const dbEvent = await Event.findById(eventToDelete._id);
      expect(dbEvent).toBeNull();
    });

    it('should fail to delete if user is not the creator', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventToDelete._id}`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should fail to delete without a token', async () => {
      const res = await request(app).delete(`/api/events/${eventToDelete._id}`);
      expect(res.statusCode).toEqual(401);
    });

    it('should return 404 if event to delete not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});

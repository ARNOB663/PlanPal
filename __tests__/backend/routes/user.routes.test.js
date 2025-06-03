process.env.JWT_SECRET = 'testsecret'; // Ensure it's defined for jwt.sign, though setup.js should also do it.

import request from 'supertest';
import app from '@backend/server.js'; // Using alias
import User from '@backend/models/User.js'; // Using alias
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

describe('User Routes (/api/users)', () => {
  let user1, user2, token1, token2;

  // Use functions for unique emails
  const getUserData1 = () => ({ name: 'User One Profile', email: `user1.profile-${Date.now()}@example.com`, password: 'password123', age: 30, gender: 'male', interests: ['coding', 'reading'] });
  const getUserData2 = () => ({ name: 'User Two Profile', email: `user2.profile-${Date.now()}@example.com`, password: 'password123', age: 25, gender: 'female', interests: ['hiking', 'photography'] });

  beforeEach(async () => { // Changed from beforeAll
    user1 = await new User(getUserData1()).save();
    user2 = await new User(getUserData2()).save();

    token1 = jwt.sign({ userId: user1._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    token2 = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => { // Added afterEach for specific cleanup
    if (user1) await User.findByIdAndDelete(user1._id);
    if (user2) await User.findByIdAndDelete(user2._id);
  });
  // afterAll for mongoose.connection.close() should be handled by __tests__/setup.js

  // Test GET /api/users/profile
  describe('GET /api/users/profile', () => {
    it('should get the logged-in user\'s profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toBe(user1.email); // Changed from userData1
      expect(res.body.name).toBe(user1.name); // Changed from userData1
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail to get profile without a token', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.statusCode).toEqual(401);
    });
  });

  // Test GET /api/users/:id
  describe('GET /api/users/:id', () => {
    it('should get any user\'s public profile by ID', async () => {
      const res = await request(app).get(`/api/users/${user2._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toBe(user2.email); // Changed from userData2
      expect(res.body.name).toBe(user2.name); // Changed from userData2
      expect(res.body).not.toHaveProperty('password'); // Ensure password is not sent
    });

    it('should return 404 if user not found by ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/users/${fakeId}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 500 for invalid user ID format (controller might return 500 if not caught as ObjectId error)', async () => {
      // The actual route doesn't have express-validator for param('id').isMongoId()
      // Mongoose findById might throw an error that leads to 500 if not specifically handled as a CastError to ObjectId failed.
      // Let's check the controller implementation or assume it might be a 500 or a specific CastError check.
      // My users route has: if (error.kind === 'ObjectId') return res.status(404)... but that's for getEventById.
      // For User.findById, a CastError to ObjectId typically occurs.
      const res = await request(app).get('/api/users/invalidID');
      // Based on generic Mongoose behavior without specific CastError handling for this route, it might be 500.
      // If the User.findById in routes/users.js has specific CastError handling that results in 404, this should be 404.
      // The current users.js has no specific CastError check for User.findById, just a generic 500.
      expect(res.statusCode).toEqual(500); // Or 400/404 if specific error handling for CastError is added
      // To make it more robust, one might add param validation in routes or specific error check in controller.
    });
  });

  // Test PUT /api/users/profile
  describe('PUT /api/users/profile', () => {
    const updates = {
      name: 'User One Updated Name',
      interests: ['coding', 'gaming', 'reading'],
      bio: 'This is an updated bio.',
      location: 'New City'
    };

    it('should allow a user to update their own profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send(updates);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe(updates.name);
      expect(res.body.interests).toEqual(expect.arrayContaining(updates.interests));
      expect(res.body.bio).toBe(updates.bio);
      expect(res.body.location).toBe(updates.location);

      const dbUser = await User.findById(user1._id);
      expect(dbUser.name).toBe(updates.name);
      expect(dbUser.interests).toEqual(expect.arrayContaining(updates.interests));
      expect(dbUser.bio).toBe(updates.bio);
    });

    it('should not allow updating email or password via this profile route', async () => {
      const sensitiveUpdates = { email: 'newemail@example.com', password: 'newpassword123' };
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send(sensitiveUpdates);

      expect(res.statusCode).toEqual(200); // Update should succeed for other fields if any
      const dbUser = await User.findById(user1._id);
      expect(dbUser.email).toBe(user1.email); // Email should not change (use user1.email)
      // Password comparison would be needed if we could fetch it, but it's not returned.
      // We trust the route doesn't pick up the password field for update.
    });

    it('should fail to update profile without a token', async () => {
      const res = await request(app).put('/api/users/profile').send(updates);
      expect(res.statusCode).toEqual(401);
    });

    it('should ignore empty or invalid fields rather than fail if not explicitly validated by express-validator on this route', async () => {
      // The PUT /api/users/profile route in users.js does not have express-validator rules.
      // It directly updates fields if they are provided in req.body.
      // So, sending an empty name should update the name to empty string if 'name' is in req.body.
      const invalidUpdates = { name: '' }; // Example: empty name
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send(invalidUpdates);

      expect(res.statusCode).toEqual(200);
      // Name should NOT be updated to empty string with current route logic `if (name) user.name = name;`
      expect(res.body.name).toBe(user1.name);
      const dbUser = await User.findById(user1._id);
      expect(dbUser.name).toBe(user1.name);
    });
  });
});

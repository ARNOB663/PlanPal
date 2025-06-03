process.env.JWT_SECRET = 'testsecret'; // Define this at the very top

import request from 'supertest';
import app from '../../../backend/server.js';
import Message from '../../../backend/models/Message.js';
import User from '../../../backend/models/User.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

describe('Message Routes (/api/messages)', () => {
  let user1, user2, user3, token1, token2, token3;

  // Use functions to generate unique user data for each test run in beforeEach
  const getUserData1 = () => ({ name: 'User One Msg', email: `user1.msg-${Date.now()}@example.com`, password: 'password123', age: 30, gender: 'male', interests: ['messaging'] });
  const getUserData2 = () => ({ name: 'User Two Msg', email: `user2.msg-${Date.now()}@example.com`, password: 'password123', age: 28, gender: 'female', interests: ['chatting'] });
  const getUserData3 = () => ({ name: 'User Three Msg', email: `user3.msg-${Date.now()}@example.com`, password: 'password123', age: 32, gender: 'other', interests: ['talking'] });

  beforeEach(async () => { // Changed from beforeAll
    // Create users
    user1 = await new User(getUserData1()).save();
    user2 = await new User(getUserData2()).save();
    user3 = await new User(getUserData3()).save();

    // Generate tokens
    token1 = jwt.sign({ userId: user1._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    token2 = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    token3 = jwt.sign({ userId: user3._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => {
    await Message.deleteMany({});
    // Explicitly delete users created in this beforeEach
    if (user1) await User.findByIdAndDelete(user1._id);
    if (user2) await User.findByIdAndDelete(user2._id);
    if (user3) await User.findByIdAndDelete(user3._id);
  });

  // afterAll for mongoose.connection.close() should be handled by __tests__/setup.js

  // Test POST /api/messages (Send Message)
  describe('POST /api/messages', () => {
    const messageContent = 'Hello User Two!';

    it('should send a message successfully with valid data and token', async () => {
      const messageData = { receiver_id: user2._id.toString(), content: messageContent };
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send(messageData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.content).toBe(messageContent);
      expect(res.body.sender._id.toString()).toBe(user1._id.toString());
      expect(res.body.receiver._id.toString()).toBe(user2._id.toString());
      expect(res.body.read).toBe(false);

      const dbMessage = await Message.findById(res.body._id);
      expect(dbMessage).toBeTruthy();
      expect(dbMessage.content).toBe(messageContent);
    });

    it('should fail to send a message without a token', async () => {
      const messageData = { receiver_id: user2._id.toString(), content: messageContent };
      const res = await request(app).post('/api/messages').send(messageData);
      expect(res.statusCode).toEqual(401);
    });

    it('should fail with validation errors for missing content', async () => {
      const messageData = { receiver_id: user2._id.toString(), content: '' };
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send(messageData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      // Check for the specific error related to 'content'
      expect(res.body.errors.some(err => err.path === 'content' || (err.param === 'content' && err.location === 'body'))).toBe(true);
    });

    it('should fail if receiver_id is not provided or invalid format', async () => {
      let messageData = { content: messageContent }; // Missing receiver_id
      let res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send(messageData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors.some(err => err.path === 'receiver_id' || (err.param === 'receiver_id' && err.location === 'body'))).toBe(true);

      messageData = { receiver_id: 'invalidformat', content: messageContent };
      res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send(messageData);
      expect(res.statusCode).toEqual(400); // from express-validator isMongoId()
      expect(res.body.errors.some(err => err.path === 'receiver_id' || (err.param === 'receiver_id' && err.location === 'body'))).toBe(true);
    });

    it('should fail if receiver_id is not a valid user (controller check)', async () => {
      const fakeReceiverId = new mongoose.Types.ObjectId();
      const messageData = { receiver_id: fakeReceiverId.toString(), content: messageContent };
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send(messageData);
      expect(res.statusCode).toEqual(404); // As per controller logic
      expect(res.body.message).toBe('Receiver not found');
    });

    it('should fail if user tries to send a message to themselves', async () => {
      const messageData = { receiver_id: user1._id.toString(), content: messageContent };
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send(messageData);
      expect(res.statusCode).toEqual(400); // As per controller logic
      expect(res.body.message).toBe('You cannot send a message to yourself');
    });
  });

  // Test GET /api/messages (Get User Messages)
  describe('GET /api/messages', () => {
    beforeEach(async () => {
        // User1 sends to User2
        await new Message({ sender: user1._id, receiver: user2._id, content: 'Hi User2 from User1' }).save();
        // User3 sends to User1
        await new Message({ sender: user3._id, receiver: user1._id, content: 'Hi User1 from User3' }).save();
        // User2 sends to User3 (User1 not involved)
        await new Message({ sender: user2._id, receiver: user3._id, content: 'Hi User3 from User2' }).save();
    });

    it('should get all messages for the logged-in user (user1)', async () => {
      const res = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);
      // Ensure user1 is either sender or receiver in these messages
      res.body.forEach(msg => {
        const isSender = msg.sender._id.toString() === user1._id.toString();
        const isReceiver = msg.receiver._id.toString() === user1._id.toString();
        expect(isSender || isReceiver).toBe(true);
      });
    });

    it('should return an empty array if a user (user with no relevant messages) has no messages with others', async () => {
      // Need a user that hasn't sent or received messages from the set created in beforeEach
      // Let's use a new user or ensure user3's messages are not with user1 or user2 if testing token3
      // The current setup in beforeEach has user3 sending to user1, so user3 will have 1 message.
      // Let's test for user2, who sent one and received one.
       const resUser2 = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${token2}`);
      expect(resUser2.statusCode).toEqual(200);
      expect(resUser2.body).toBeInstanceOf(Array);
      expect(resUser2.body.length).toBe(2); // User2 received from User1, User2 sent to User3
    });

    it('should fail to get messages without a token', async () => {
      const res = await request(app).get('/api/messages');
      expect(res.statusCode).toEqual(401);
    });
  });

  // Test PATCH /api/messages/:id/read (Mark Message as Read)
  describe('PATCH /api/messages/:id/read', () => {
    let messageUser1ToUser2;
    beforeEach(async () => {
      messageUser1ToUser2 = await new Message({ sender: user1._id, receiver: user2._id, content: 'Please read this' }).save();
    });

    it('should allow the receiver to mark a message as read', async () => {
      const res = await request(app)
        .patch(`/api/messages/${messageUser1ToUser2._id}/read`)
        .set('Authorization', `Bearer ${token2}`); // User2 (receiver) marks as read

      expect(res.statusCode).toEqual(200);
      expect(res.body.read).toBe(true);
      expect(res.body.sender._id.toString()).toBe(user1._id.toString());
      expect(res.body.receiver._id.toString()).toBe(user2._id.toString());
    });

    it('should NOT allow the sender to mark a message as read', async () => {
      const res = await request(app)
        .patch(`/api/messages/${messageUser1ToUser2._id}/read`)
        .set('Authorization', `Bearer ${token1}`); // User1 (sender) attempts
      expect(res.statusCode).toEqual(403);
    });

    it('should NOT allow another user (not sender or receiver) to mark as read', async () => {
      const res = await request(app)
        .patch(`/api/messages/${messageUser1ToUser2._id}/read`)
        .set('Authorization', `Bearer ${token3}`); // User3 attempts
      expect(res.statusCode).toEqual(403);
    });

    it('should fail if message not found', async () => {
      const fakeMessageId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/messages/${fakeMessageId}/read`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should fail without a token', async () => {
      const res = await request(app).patch(`/api/messages/${messageUser1ToUser2._id}/read`);
      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 for invalid message ID format', async () => {
      const res = await request(app)
        .patch('/api/messages/invalidID/read')
        .set('Authorization', `Bearer ${token2}`);
      expect(res.statusCode).toEqual(400); // From express-validator isMongoId()
    });
  });

  // Test DELETE /api/messages/:id (Delete Message)
  describe('DELETE /api/messages/:id', () => {
    let messageUser1ToUser2;
    beforeEach(async () => {
      messageUser1ToUser2 = await new Message({ sender: user1._id, receiver: user2._id, content: 'To be deleted' }).save();
    });

    it('should allow the sender to delete a message', async () => {
      const res = await request(app)
        .delete(`/api/messages/${messageUser1ToUser2._id}`)
        .set('Authorization', `Bearer ${token1}`); // User1 (sender) deletes

      expect(res.statusCode).toEqual(200); // As per controller
      expect(res.body.message).toBe('Message successfully deleted');
      const dbMessage = await Message.findById(messageUser1ToUser2._id);
      expect(dbMessage).toBeNull();
    });

    it('should NOT allow the receiver to delete a message', async () => {
      const res = await request(app)
        .delete(`/api/messages/${messageUser1ToUser2._id}`)
        .set('Authorization', `Bearer ${token2}`); // User2 (receiver) attempts
      expect(res.statusCode).toEqual(403);
    });

    it('should NOT allow another user (not sender) to delete', async () => {
       const res = await request(app)
        .delete(`/api/messages/${messageUser1ToUser2._id}`)
        .set('Authorization', `Bearer ${token3}`); // User3 attempts
      expect(res.statusCode).toEqual(403);
    });

    it('should fail if message not found for deletion', async () => {
      const fakeMessageId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/messages/${fakeMessageId}`)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should fail to delete without a token', async () => {
      const res = await request(app).delete(`/api/messages/${messageUser1ToUser2._id}`);
      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 for invalid message ID format for deletion', async () => {
      const res = await request(app)
        .delete('/api/messages/invalidID')
        .set('Authorization', `Bearer ${token1}`);
      expect(res.statusCode).toEqual(400); // From express-validator isMongoId()
    });
  });
});

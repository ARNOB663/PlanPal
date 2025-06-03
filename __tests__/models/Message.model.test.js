import Message from '../../backend/models/Message.js';
import User from '../../backend/models/User.js';
import mongoose from 'mongoose';

describe('Message Model', () => {
  let dummySender;
  let dummyReceiver;

  beforeEach(async () => { // Changed from beforeAll to beforeEach
    // Setup dummy users
    const senderData = {
      name: 'Sender User',
      email: `sender-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      gender: 'female',
      age: 28,
    };
    dummySender = new User(senderData);
    await dummySender.save();

    const receiverData = {
      name: 'Receiver User',
      email: `receiver-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      gender: 'male',
      age: 32,
    };
    dummyReceiver = new User(receiverData);
    await dummyReceiver.save();
  });

  afterEach(async () => { // Changed from afterAll to afterEach
    // Clean up dummy users
    if (dummySender) await User.findByIdAndDelete(dummySender._id);
    if (dummyReceiver) await User.findByIdAndDelete(dummyReceiver._id);
    dummySender = null;
    dummyReceiver = null;
    // Also clear Messages, setup.js beforeEach might already do this
    await Message.deleteMany({});
  });

  // Test successful message creation
  it('should create a message successfully with valid data', async () => {
    const messageData = {
      sender: dummySender._id,
      receiver: dummyReceiver._id,
      content: 'Hello, this is a test message!',
    };
    const message = new Message(messageData);
    const savedMessage = await message.save();

    expect(savedMessage).not.toBeNull();
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.sender.toString()).toBe(dummySender._id.toString());
    expect(savedMessage.receiver.toString()).toBe(dummyReceiver._id.toString());
    expect(savedMessage.content).toBe(messageData.content);
  });

  // Test population of sender and receiver fields
  it('should populate sender and receiver fields', async () => {
    const messageData = {
      sender: dummySender._id,
      receiver: dummyReceiver._id,
      content: 'Another test message for population.',
    };
    const message = new Message(messageData);
    await message.save();

    const foundMessage = await Message.findById(message._id).populate('sender').populate('receiver');

    expect(foundMessage.sender).toBeInstanceOf(Object);
    expect(foundMessage.sender.name).toBe(dummySender.name);
    expect(foundMessage.sender.email).toBe(dummySender.email);

    expect(foundMessage.receiver).toBeInstanceOf(Object);
    expect(foundMessage.receiver.name).toBe(dummyReceiver.name);
    expect(foundMessage.receiver.email).toBe(dummyReceiver.email);
  });

  // Test required fields
  it('should fail if required fields are missing', async () => {
    const requiredFields = ['sender', 'receiver', 'content'];

    for (const field of requiredFields) {
      const messageData = {
        sender: dummySender._id,
        receiver: dummyReceiver._id,
        content: 'Test message for required fields.',
      };
      // Remove one required field at a time
      if (field === 'sender' || field === 'receiver') {
        // For ObjectId fields, setting to undefined is appropriate
        messageData[field] = undefined;
      } else {
        delete messageData[field];
      }

      const message = new Message(messageData);
      try {
        await message.save();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.errors[field].kind).toBe('required');
      }
    }
  });

  // Test `read` default value
  it('should default `read` to false', async () => {
    const messageData = {
      sender: dummySender._id,
      receiver: dummyReceiver._id,
      content: 'Test message for read default value.',
      // `read` field is not explicitly set
    };
    const message = new Message(messageData);
    const savedMessage = await message.save();

    expect(savedMessage.read).toBe(false);
  });
});

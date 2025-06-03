import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Set environment variables for tests
process.env.JWT_SECRET = 'testsecret';
process.env.NODE_ENV = 'test'; // Ensure NODE_ENV is explicitly 'test'

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

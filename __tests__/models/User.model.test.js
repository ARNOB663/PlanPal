import User from '../../backend/models/User.js';
import mongoose from 'mongoose';

describe('User Model', () => {
  // Test successful user creation
  it('should create a user successfully with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      gender: 'male',
      age: 25,
    };
    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser).not.toBeNull();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
  });

  // Test password hashing
  it('should hash the password before saving', async () => {
    const userData = {
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123',
      gender: 'female',
      age: 30,
    };
    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.password).not.toBe(userData.password);
  });

  // Test comparePassword method
  it('should correctly compare passwords with comparePassword method', async () => {
    const userData = {
      name: 'Test User 3',
      email: 'test3@example.com',
      password: 'password123',
      gender: 'other',
      age: 35,
    };
    const user = new User(userData);
    await user.save();

    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  // Test required fields
  it('should fail if required fields are missing', async () => {
    const requiredFields = ['name', 'email', 'password', 'gender', 'age'];
    for (const field of requiredFields) {
      const userData = {
        name: 'Test User 4',
        email: 'test4@example.com',
        password: 'password123',
        gender: 'male',
        age: 20,
      };
      delete userData[field];

      const user = new User(userData);
      try {
        await user.save();
      } catch (error) {
        expect(error.errors[field].kind).toBe('required');
      }
    }
  });

  // Test unique fields
  it('should fail if email is not unique', async () => {
    const userData1 = {
      name: 'Test User 5',
      email: 'test5@example.com',
      password: 'password123',
      gender: 'female',
      age: 28,
    };
    await new User(userData1).save();

    const userData2 = {
      name: 'Test User 6',
      email: 'test5@example.com', // Same email as user1
      password: 'password123',
      gender: 'male',
      age: 32,
    };
    try {
      await new User(userData2).save();
    } catch (error) {
      expect(error.code).toBe(11000);
      expect(error.keyPattern.email).toBe(1);
    }
  });
});

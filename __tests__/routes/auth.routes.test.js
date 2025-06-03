import request from 'supertest';
import app from '../../backend/server.js'; // Ensure server.js exports app
import User from '../../backend/models/User.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'; // Added import

describe('Auth Routes (/api/auth)', () => {
  const testUserPassword = 'password123';
  // Function to get fresh baseUserData with a unique email
  const getBaseUserData = (emailSuffix = 'testuser') => ({
    name: 'Test User',
    email: `${emailSuffix}-${Date.now()}@example.com`, // Unique email
    password: testUserPassword,
    age: 30,
    gender: 'male',
    interests: ['testing', 'coding'],
  });

  let currentTestUserData; // To hold data for the current test context

  // Global beforeEach in __tests__/setup.js clears all collections.
  // afterAll for mongoose.connection.close() is in setup.js.

  describe('POST /api/auth/register', () => {
    beforeEach(() => {
      currentTestUserData = getBaseUserData(); // Fresh data for each registration test
    });

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(currentTestUserData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBe(currentTestUserData.name);
      expect(res.body.user.email).toBe(currentTestUserData.email);
      expect(res.body.user).not.toHaveProperty('password');

      const dbUser = await User.findOne({ email: currentTestUserData.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(currentTestUserData.name);
    });

    it('should fail to register a user with an existing email', async () => {
      // First, register a user
      await request(app).post('/api/auth/register').send(currentTestUserData);

      // Attempt to register another user with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...currentTestUserData, name: 'Another User' }); // Same email

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('should fail if required fields are missing (e.g., email)', async () => {
      const { email, ...userDataWithoutEmail } = currentTestUserData;
      const res = await request(app)
        .post('/api/auth/register')
        .send(userDataWithoutEmail);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(err => err.path === 'email')).toBe(true);
    });

    it('should fail if required fields are missing (e.g., password)', async () => {
      const { password, ...userDataWithoutPassword } = currentTestUserData;
      const res = await request(app)
        .post('/api/auth/register')
        .send(userDataWithoutPassword);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(err => err.path === 'password')).toBe(true);
    });

    it('should fail if required fields are missing (e.g., name)', async () => {
      const { name, ...userDataWithoutName } = currentTestUserData;
      const res = await request(app)
        .post('/api/auth/register')
        .send(userDataWithoutName);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(err => err.path === 'name')).toBe(true);
    });
     it('should fail if age is missing or invalid', async () => {
      const { age, ...userDataWithoutAge } = currentTestUserData;
      const res = await request(app)
        .post('/api/auth/register')
        .send(userDataWithoutAge);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(err => err.path === 'age')).toBe(true);

      const resInvalidAge = await request(app)
        .post('/api/auth/register')
        .send({...currentTestUserData, age: 17 });

      expect(resInvalidAge.statusCode).toEqual(400);
      expect(resInvalidAge.body.errors.some(err => err.path === 'age' && err.msg.includes('Must be at least 18 years old'))).toBe(true);
    });

    it('should fail if gender is missing or invalid', async () => {
      const { gender, ...userDataWithoutGender } = currentTestUserData;
      const res = await request(app)
        .post('/api/auth/register')
        .send(userDataWithoutGender);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.some(err => err.path === 'gender')).toBe(true);

      const resInvalidGender = await request(app)
        .post('/api/auth/register')
        .send({...currentTestUserData, gender: 'unknown' });

      expect(resInvalidGender.statusCode).toEqual(400);
      expect(resInvalidGender.body.errors.some(err => err.path === 'gender' && err.msg.includes('Invalid gender'))).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    let loginUserData; // User data for login tests

    beforeEach(async () => {
      loginUserData = getBaseUserData('loginuser'); // Fresh, unique user for each login test sequence
      // Register this user
      await new User(loginUserData).save();
    });

    afterEach(async () => { // Clean up user created for login tests
        if(loginUserData && loginUserData.email) { // Check if user was created
            const userToDelete = await User.findOne({email: loginUserData.email});
            if(userToDelete) await User.findByIdAndDelete(userToDelete._id);
        }
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserData.email,
          password: loginUserData.password,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(loginUserData.email);
    });

    it('should fail to login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserData.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail to login with a non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: loginUserData.password,
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('Accessing Protected Routes (/api/users/profile)', () => {
    let protectedRouteToken;
    let protectedRouteUser;

    beforeEach(async () => {
      const userData = getBaseUserData('protected');
      protectedRouteUser = await new User(userData).save();
      protectedRouteToken = jwt.sign({ userId: protectedRouteUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterEach(async () => { // Clean up user created for protected route tests
        if(protectedRouteUser) await User.findByIdAndDelete(protectedRouteUser._id);
    });

    it('should access a protected route with a valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${protectedRouteToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeDefined();
      expect(res.body._id.toString()).toBe(protectedRouteUser._id.toString());
      expect(res.body.email).toBe(protectedRouteUser.email);
    });

    it('should fail to access a protected route without a token', async () => {
      const res = await request(app).get('/api/users/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized');
    });

    it('should fail to access a protected route with an invalid/expired token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer aninvalidorfaketoken');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized'); // Middleware catches jwt malformed or invalid signature
    });
  });
});

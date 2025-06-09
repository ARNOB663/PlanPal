# PlanPal Backend

This is the backend server for the PlanPal application. It's designed to be deployed independently.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- npm or yarn package manager

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. For production:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Events
- GET `/api/events` - Get all events
- POST `/api/events` - Create new event
- GET `/api/events/:id` - Get event by ID
- PUT `/api/events/:id` - Update event
- DELETE `/api/events/:id` - Delete event

### Messages
- GET `/api/messages` - Get all messages
- POST `/api/messages` - Send new message
- GET `/api/messages/:id` - Get message by ID

## Deployment

The backend can be deployed to any Node.js hosting platform (e.g., Heroku, DigitalOcean, AWS):

1. Set up the environment variables on your hosting platform
2. Push the code to your repository
3. Configure the build and start commands:
   - Build: `npm install`
   - Start: `npm start`

## Testing

Run tests with:
```bash
npm test
``` 
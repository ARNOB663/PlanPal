# MeetBuddy - Social Events Platform

## Description

MeetBuddy is a full-stack web application designed to help users discover, create, and join social events. It features user authentication, event management, real-time messaging (conceptually), and user profiles.

## Features

*   User registration and login (JWT-based authentication)
*   Create, view, update, and delete events
*   Browse and search for events
*   User profiles
*   Messaging between users (conceptual, with basic API endpoints)
*   MongoDB for data storage, Mongoose ODM

## Tech Stack

**Backend:**
*   Node.js
*   Express.js
*   MongoDB (with Mongoose ODM)
*   JSON Web Tokens (JWT) for authentication
*   `express-validator` for input validation

**Frontend (based on existing file structure):**
*   React (with TypeScript)
*   Vite (build tool and dev server)
*   Tailwind CSS (likely, based on common config files)

**Testing:**
*   Jest (testing framework)
*   Supertest (for API endpoint testing)
*   MongoDB Memory Server (for isolated database testing)

## Prerequisites

*   Node.js (v16 or later recommended)
*   npm (comes with Node.js) or yarn
*   MongoDB: A running MongoDB instance (local or cloud-hosted like MongoDB Atlas).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  **Install Dependencies:**
    *   Navigate to the project root directory (if you're not already there).
    *   Install all dependencies (for both backend and frontend, as defined in the root `package.json`):
        ```bash
        npm install
        ```

3.  **Environment Variables:**
    *   Create a `.env` file in the `backend/` directory (`backend/.env`).
    *   Add the following required environment variables:
        ```env
        PORT=5000 # Or any port you prefer for the backend
        MONGO_URI=your_mongodb_connection_string # Replace with your actual MongoDB URI
        JWT_SECRET=your_very_strong_jwt_secret # Replace with a strong, random secret
        NODE_ENV=development # Or 'production'
        ```
        *(Note: For email functionality like password reset, SMTP server details would also be needed in the .env file, e.g., `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `CLIENT_URL` for constructing reset links.)*


4.  **Running the Application:**
    *   **Backend Server:** The backend server is started from the root directory.
        ```bash
        npm run dev
        ```
        This command (as per current `package.json`) runs `nodemon backend/server.js`. The backend will be accessible based on your `PORT` environment variable (e.g., `http://localhost:5000`).

    *   **Frontend Development Server:** The frontend is managed by Vite (config files like `vite.config.ts` are at the root).
        ```bash
        # The root package.json might not have a separate script for Vite if `npm run dev` is for the backend.
        # You might need to add one or run Vite directly if it's installed globally.
        # If Vite is a dev dependency (it is), you can add a script to your package.json:
        # "scripts": {
        #   ...
        #   "dev:frontend": "vite"
        # }
        # Then run:
        npm run dev:frontend
        # OR, if you prefer to use the default Vite command and it's not conflicting:
        # npx vite
        ```
        The frontend will typically be accessible at `http://localhost:5173` (Vite's default). Check your Vite configuration or console output. Ensure the backend is running, as the frontend will likely make API calls to it.

5.  **Running Tests:**
    To run the backend test suite:
    ```bash
    npm test
    ```

## API Endpoints

The backend API provides the following main groups of endpoints (all prefixed with `/api`):

*   **Auth (`/api/auth`):**
    *   `POST /register`: User registration.
    *   `POST /login`: User login.
*   **Users (`/api/users`):**
    *   `GET /profile`: Get current logged-in user's profile.
    *   `PUT /profile`: Update current user's profile.
    *   `GET /:id`: Get a user's public profile by ID.
*   **Events (`/api/events`):**
    *   `POST /`: Create a new event (authenticated).
    *   `GET /`: Get all events.
    *   `GET /:id`: Get a specific event by ID.
    *   `PUT /:id`: Update an event (authenticated, creator only).
    *   `DELETE /:id`: Delete an event (authenticated, creator only).
*   **Messages (`/api/messages`):**
    *   `POST /`: Send a message (authenticated).
    *   `GET /`: Get messages for the logged-in user.
    *   `PATCH /:id/read`: Mark a message as read (authenticated, receiver only).
    *   `DELETE /:id`: Delete a message (authenticated, sender only).

For detailed request/response formats, please refer to the route definitions in `backend/routes/` and controller logic in `backend/controllers/`.

## Project Structure

*   `backend/`: Contains all the server-side Node.js/Express.js code.
    *   `controllers/`: Logic for handling requests.
    *   `middleware/`: Custom middleware (e.g., authentication).
    *   `models/`: Mongoose schemas and models.
    *   `routes/`: API route definitions.
    *   `server.js`: Main backend server entry point.
    *   `.env`: (You create this) Environment variables.
*   `src/`: Contains the client-side React/TypeScript frontend code.
    *   `components/`: Reusable UI components.
    *   `pages/`: Page-level components.
    *   `App.tsx`: Main application component.
    *   `main.tsx`: Frontend entry point.
*   `__tests__/`: Contains all Jest tests.
    *   `models/`: Model unit tests.
    *   `backend/routes/`: API route integration tests.
    *   `setup.js`: Jest global setup for test environment (e.g., in-memory DB, env vars).
*   `utils/`: Utility functions (e.g., email sending).
*   `README.md`: This file.
*   `package.json`: Project dependencies and scripts.
*   `vite.config.ts`, `tailwind.config.js`, etc.: Frontend build and tooling configurations.

```

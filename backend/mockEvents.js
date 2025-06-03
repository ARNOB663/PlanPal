import mongoose from 'mongoose';
import Event from './models/Event.js';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Mock event data
const mockEvents = [
  {
    title: "Summer Beach Party",
    description: "Join us for an amazing beach party with music, games, and great company!",
    date: new Date("2024-07-15"),
    time: "14:00",
    location: "Santa Monica Beach",
    coordinates: {
      lat: 34.0195,
      lng: -118.4912
    },
    maxParticipants: 50,
    genderPreference: "any",
    ageRange: {
      min: 21,
      max: 45
    },
    category: "Party",
    visibility: "public",
    imageUrl: "https://example.com/beach-party.jpg",
    photos: [
      "https://example.com/beach-party-1.jpg",
      "https://example.com/beach-party-2.jpg"
    ],
    venue: {
      name: "Santa Monica Beach",
      address: "200 Santa Monica Pier, Santa Monica, CA 90401",
      parking: "Public parking available at the pier",
      transit: "Metro Expo Line to Downtown Santa Monica"
    }
  },
  {
    title: "Tech Workshop: Web Development",
    description: "Learn modern web development techniques in this hands-on workshop.",
    date: new Date("2024-06-20"),
    time: "10:00",
    location: "Tech Hub Downtown",
    coordinates: {
      lat: 34.0522,
      lng: -118.2437
    },
    maxParticipants: 20,
    genderPreference: "any",
    ageRange: {
      min: 18,
      max: 65
    },
    category: "Workshop",
    visibility: "public",
    imageUrl: "https://example.com/tech-workshop.jpg",
    photos: [
      "https://example.com/tech-workshop-1.jpg"
    ],
    venue: {
      name: "Tech Hub Downtown",
      address: "123 Tech Street, Los Angeles, CA 90014",
      parking: "Street parking available",
      transit: "Metro Red Line to Pershing Square"
    }
  },
  {
    title: "Women's Soccer Tournament",
    description: "Annual women's soccer tournament. All skill levels welcome!",
    date: new Date("2024-08-05"),
    time: "09:00",
    location: "Central Park Sports Complex",
    coordinates: {
      lat: 34.0522,
      lng: -118.2437
    },
    maxParticipants: 32,
    genderPreference: "female",
    ageRange: {
      min: 18,
      max: 50
    },
    category: "Sports",
    visibility: "public",
    imageUrl: "https://example.com/soccer-tournament.jpg",
    photos: [
      "https://example.com/soccer-tournament-1.jpg",
      "https://example.com/soccer-tournament-2.jpg"
    ],
    venue: {
      name: "Central Park Sports Complex",
      address: "456 Sports Avenue, Los Angeles, CA 90012",
      parking: "Free parking available",
      transit: "Metro Gold Line to Chinatown"
    }
  },
  {
    title: "Jazz Night at Blue Note",
    description: "Experience an evening of smooth jazz with local artists.",
    date: new Date("2024-07-01"),
    time: "20:00",
    location: "Blue Note Jazz Club",
    coordinates: {
      lat: 34.0522,
      lng: -118.2437
    },
    maxParticipants: 100,
    genderPreference: "any",
    ageRange: {
      min: 21,
      max: 65
    },
    category: "Concert",
    visibility: "public",
    imageUrl: "https://example.com/jazz-night.jpg",
    photos: [
      "https://example.com/jazz-night-1.jpg"
    ],
    venue: {
      name: "Blue Note Jazz Club",
      address: "789 Music Street, Los Angeles, CA 90015",
      parking: "Valet parking available",
      transit: "Metro Purple Line to 7th Street/Metro Center"
    }
  },
  {
    title: "Startup Networking Mixer",
    description: "Connect with fellow entrepreneurs and investors in a casual setting.",
    date: new Date("2024-06-25"),
    time: "18:00",
    location: "Innovation Hub",
    coordinates: {
      lat: 34.0522,
      lng: -118.2437
    },
    maxParticipants: 75,
    genderPreference: "any",
    ageRange: {
      min: 25,
      max: 55
    },
    category: "Conference",
    visibility: "public",
    imageUrl: "https://example.com/networking-mixer.jpg",
    photos: [
      "https://example.com/networking-mixer-1.jpg"
    ],
    venue: {
      name: "Innovation Hub",
      address: "321 Startup Blvd, Los Angeles, CA 90013",
      parking: "Underground parking available",
      transit: "Metro Red Line to Civic Center"
    }
  }
];

// Function to seed the database with mock events
async function seedEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a user to be the creator
    const creator = await User.findOne();
    if (!creator) {
      console.error('No users found in the database. Please create a user first.');
      process.exit(1);
    }

    // Add creator and participants to events
    const eventsWithCreator = mockEvents.map(event => ({
      ...event,
      creator: creator._id,
      participants: [creator._id],
      pendingParticipants: [],
      interestedUsers: []
    }));

    // Insert events
    const createdEvents = await Event.insertMany(eventsWithCreator);
    console.log(`Successfully created ${createdEvents.length} events`);

    // Update user's eventsCreated array
    await User.findByIdAndUpdate(creator._id, {
      $push: { eventsCreated: { $each: createdEvents.map(event => event._id) } }
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedEvents(); 
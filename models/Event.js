import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 2
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  interestedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  genderPreference: {
    type: String,
    enum: ['female', 'male', 'any'],
    default: 'any'
  },
  ageRange: {
    min: {
      type: Number,
      required: true,
      min: 18
    },
    max: {
      type: Number,
      required: true
    }
  },
  category: {
    type: String,
    enum: ['Concert', 'Sports', 'Party', 'Conference', 'Workshop', 'Other'],
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'friends'],
    default: 'public'
  },
  imageUrl: String,
  photos: [String],
  taggedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  venue: {
    name: String,
    address: String,
    parking: String,
    transit: String
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
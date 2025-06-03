import Message from '../models/Message.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';


// Send a new message
export const sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    // Check if receiver_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiver_id)) {
        return res.status(400).json({ message: 'Invalid receiver ID format' });
    }

    // Check if receiver exists
    const receiverExists = await User.findById(receiver_id);
    if (!receiverExists) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Prevent user from sending message to themselves
    if (sender_id === receiver_id) {
        return res.status(400).json({ message: 'You cannot send a message to yourself' });
    }

    const newMessage = new Message({
      sender: sender_id,
      receiver: receiver_id,
      content,
    });

    const savedMessage = await newMessage.save();

    // Populate sender and receiver details for the response
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'name email photoUrl')
      .populate('receiver', 'name email photoUrl');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get all messages for the logged-in user
export const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
    .populate('sender', 'name email photoUrl')
    .populate('receiver', 'name email photoUrl')
    .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ message: 'Error fetching user messages', error: error.message });
  }
};

// Mark a message as read
export const markMessageAsRead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only the receiver can mark the message as read
    if (message.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to mark this message as read' });
    }

    // If already read, just return the message
    if (message.read) {
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name email photoUrl')
            .populate('receiver', 'name email photoUrl');
        return res.status(200).json(populatedMessage);
    }

    message.read = true;
    await message.save();

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email photoUrl')
        .populate('receiver', 'name email photoUrl');

    res.status(200).json(populatedMessage);
  } catch (error) {
    console.error('Error marking message as read:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Message not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only the sender can delete the message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: 'Message successfully deleted' }); // Or 204 No Content
  } catch (error) {
    console.error('Error deleting message:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Message not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};

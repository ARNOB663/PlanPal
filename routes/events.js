import express from 'express';
import { Router } from 'express';

const router = Router();

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.events.findMany({
      include: {
        creator: true
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.events.findUnique({
      where: { id: req.params.id },
      include: {
        creator: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new event
router.post('/', async (req, res) => {
  try {
    const event = await prisma.events.create({
      data: {
        ...req.body,
        creator_id: req.user.id // Assuming user is authenticated
      }
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update event
router.put('/:id', async (req, res) => {
  try {
    const event = await prisma.events.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    await prisma.events.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
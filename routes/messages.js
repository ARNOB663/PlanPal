import express from 'express';
const router = express.Router();

// Get all messages for a user (either as sender or receiver)
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    const { data: messages, error } = await req.supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;
    const { data: message, error } = await req.supabase
      .from('messages')
      .insert([{ sender_id, receiver_id, content }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: message, error } = await req.supabase
      .from('messages')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await req.supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
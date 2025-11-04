import express from 'express';
import { createCalendarEvent } from './calendarAPI.js';

const router = express.Router();

router.post('/create-event', async (req, res) => {
  try {
    const event = await createCalendarEvent(req.body);
    res.json({ success: true, event });
  } catch (error: any) {
    console.error('Calendar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createCalendarEvent } from './calendarAPI.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/api/calendar/create-event', async (req, res) => {
  try {
    const event = await createCalendarEvent(req.body);
    res.json({ success: true, event });
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

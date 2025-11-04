import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import calendarRouter from './api/calendar.js';

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Mount routes
app.use('/api/calendar', calendarRouter);

// Default route
app.get('/', (req, res) => {
  res.send('BESA Booking API running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:${PORT}");
});

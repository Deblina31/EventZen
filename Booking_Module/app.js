// app.js
const express = require('express');
const app = express();
const cors = require('cors');
const bookingRoutes = require('./routes/bookingRoutes');
const sequelize = require('./config/db');
require('dotenv').config();

app.use(cors({
  origin: "http://localhost:3000",
}));

app.use(express.json());
app.use('/bookings', bookingRoutes);

sequelize.sync({ alter: true }) 
  .then(() => console.log('All models synced'))
  .catch(err => console.error('DB sync error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Booking service running on port ${PORT}`));
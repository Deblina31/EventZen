const express      = require('express');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const sequelize    = require('./config/db');
const bookingRoutes  = require('./routes/bookingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');
require('dotenv').config();

const app = express();

//Rate limiting 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 100,               
  message: { error: 'Too many requests, please try again later' }
});

//Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(limiter);

//Routes
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

//Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'booking-service' }));

//Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Models synced');
    }

    app.listen(PORT, () =>
      console.log(`Booking service running on port ${PORT}`)
    );
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
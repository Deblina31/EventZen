// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking, getBookings, deleteBooking} = require('../controllers/bookingController');
const verifyJWT = require('../middlewares/authMiddleware');

// POST /bookings → create a new booking
router.post('/', verifyJWT, createBooking);

// Get bookings
router.get('/', verifyJWT, getBookings);

// Delete a booking
router.delete('/:id', verifyJWT, deleteBooking);





module.exports = router;
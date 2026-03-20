// controllers/bookingController.js
const axios = require('axios');
const Booking = require('../models/bookingModel');
require('dotenv').config();

//POST
const createBooking = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // 1️⃣ Verify event exists by calling Spring Boot Event Module
    const eventResponse = await axios.get(
  `${process.env.EVENT_SERVICE_URL}/events/${eventId}`,
  {
    headers: {
      Authorization: req.headers['authorization'], // forward user JWT
    },
  }
);

    // 2️⃣ Create booking in MySQL
    const booking = await Booking.create({
      userId: req.user.id,   // from JWT middleware
      eventId,
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Booking creation error:', error.message);

    // Handle specific error from Spring Boot
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};


//GET
// controllers/bookingController.js
const getBookings = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let bookings;
    if (role === 'ADMIN') {
      // Admin sees all bookings
      bookings = await Booking.findAll();
    } else {
      // Normal users see only their bookings
      bookings = await Booking.findAll({ where: { userId } });
    }

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};


//DELETE
// controllers/bookingController.js
const deleteBooking = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const bookingId = req.params.id;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only owner or admin can delete
    if (booking.userId !== userId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Not allowed to delete this booking' });
    }

    await booking.destroy();
    return res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createBooking, getBookings, deleteBooking };
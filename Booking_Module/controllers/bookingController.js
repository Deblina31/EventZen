const axios = require('axios');
const Booking = require('../models/bookingModel');
require('dotenv').config();

const createBooking = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const eventResponse = await axios.get(
  `${process.env.EVENT_SERVICE_URL}/events/${eventId}`,
  {
    headers: {
      Authorization: req.headers['authorization'],
    }
  }
);

    const booking = await Booking.create({
      userId: req.user.id, 
      eventId,
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Booking creation error:', error.message);

    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};


const getBookings = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let bookings;
    if (role === 'ADMIN') {
      bookings = await Booking.findAll();
    } else {
      bookings = await Booking.findAll({ where: { userId } });
    }

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};


const deleteBooking = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const bookingId = req.params.id;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

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
const axios = require('axios');
const Booking = require('../models/bookingModel');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

//Validation rules
const createBookingRules = [
  body('eventId').notEmpty().isInt({ gt: 0 }).withMessage('Valid event ID is required'),
  body('ticketType').optional().isString().trim(),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateStatusRules = [
  body('status')
    .notEmpty()
    .isIn(['pending', 'confirmed', 'cancelled'])
    .withMessage('Status must be pending, confirmed or cancelled'),
];

//POST/ Create a new booking
const createBooking = [
  ...createBookingRules,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { eventId, ticketType, quantity = 1 } = req.body;

    // verify event exists in event service
    const eventResponse = await axios.get(
      `${process.env.EVENT_SERVICE_URL}/events/${eventId}`,
      { headers: { Authorization: req.headers['authorization'] } }
    );

    const event = eventResponse.data;

    const booking = await Booking.create({
      userId:           req.user.id,
      eventId,
      ticketType:       ticketType || null,
      quantity,
      status:           'pending',
      paymentStatus:    'pending',
      registrationDate: new Date()
    });

    return res.status(201).json(booking);
  })
];

//GET all bookings
const getBookings = asyncHandler(async (req, res) => {
  const { id: userId, role } = req.user;

  const where = role === 'ADMIN' ? {} : { userId };
  const bookings = await Booking.findAll({ where });

  return res.status(200).json(bookings);
});

//GET booking by id
const getBookingById = asyncHandler(async (req, res) => {
  const { id: userId, role } = req.user;
  const booking = await Booking.findByPk(req.params.id);

  if (!booking)
    return res.status(404).json({ error: 'Booking not found' });

  if (role !== 'ADMIN' && booking.userId !== userId)
    return res.status(403).json({ error: 'Forbidden' });

  return res.status(200).json(booking);
});

//PATCH/ Edit a booking only permitted to ADMIN
const updateBookingStatus = [
  ...updateStatusRules,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const booking = await Booking.findByPk(req.params.id);
    if (!booking)
      return res.status(404).json({ error: 'Booking not found' });

    await booking.update({ status: req.body.status });
    return res.status(200).json(booking);
  })
];

// ── DELETE/ Cancel a booking
const cancelBooking = asyncHandler(async (req, res) => {
  const { id: userId, role } = req.user;
  const booking = await Booking.findByPk(req.params.id);

  if (!booking)
    return res.status(404).json({ error: 'Booking not found' });

  if (booking.status === 'cancelled')
    return res.status(400).json({ error: 'Booking is already cancelled' });

  // only owner or admin can cancel
  if (role !== 'ADMIN' && booking.userId !== userId)
    return res.status(403).json({ error: 'Forbidden' });

  await booking.update({
    status: 'cancelled'
  });

  return res.status(204).send();
});

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};
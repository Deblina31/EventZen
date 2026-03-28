const axios = require('axios');
const Booking = require('../models/bookingModel');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const createBookingRules = [
    body('eventId').notEmpty().isInt({ gt: 0 }).withMessage('Valid event ID required'),
    body('ticketType').notEmpty().withMessage('Ticket type is required (STANDARD, VIP, PREMIUM)'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price cannot be negative'),
];

const updateStatusRules = [
    body('status')
        .notEmpty()
        .isIn(['pending', 'confirmed', 'cancelled'])
        .withMessage('Status must be pending, confirmed or cancelled'),
];

// POST / Create a new booking
const createBooking = [
    ...createBookingRules,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            eventId,
            ticketType = 'STANDARD',
            quantity = 1,
            price = 0,
        } = req.body;

        try {
            await axios.get(
                `${process.env.EVENT_SERVICE_URL}/events/${eventId}`,
                { headers: { Authorization: req.headers['authorization'] } }
            );
        } catch (err) {
            if (err.response?.status === 404) {
                return res.status(404).json({ error: 'Event not found' });
            }
            return res.status(502).json({ error: 'Event service unavailable' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId: parseInt(eventId),
            ticketType: ticketType.toUpperCase(),
            quantity: parseInt(quantity),
            price: parseFloat(price),
            status: 'confirmed',
            paymentStatus: 'paid',
            registrationDate: new Date(),
        });

        try {
            await axios.patch(
                `${process.env.EVENT_SERVICE_URL}/events/${eventId}/ticket-sale`,
                { 
                    amount: parseFloat(price) * parseInt(quantity), 
                    ticketType: ticketType.toUpperCase(),
                    quantity: parseInt(quantity)
                },
                { headers: { Authorization: req.headers['authorization'] } }
            );
        } catch (err) {
            console.error('Failed to update Event Service budget:', err.message);
        }

        return res.status(201).json(booking);
    })
];

// GET all bookings
const getBookings = asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;

    // Admins see everything, Users see only their own
    const where = role === 'ADMIN' ? {} : { userId };
    const bookings = await Booking.findAll({ where });

    return res.status(200).json(bookings);
});

// GET booking by id
const getBookingById = asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    if (role !== 'ADMIN' && booking.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this booking' });
    }

    return res.status(200).json(booking);
});

// PATCH / Edit status (Admin only)
const updateBookingStatus = [
    ...updateStatusRules,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        await booking.update({ status: req.body.status });
        return res.status(200).json(booking);
    })
];

// DELETE / Cancel a booking
const cancelBooking = asyncHandler(async (req, res) => {
    const { id: userId, role } = req.user;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
        return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Only owner or admin can cancel
    if (role !== 'ADMIN' && booking.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    await booking.update({ status: 'cancelled' });
    return res.status(204).send();
});

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking
};
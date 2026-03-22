const express = require('express');
const router = express.Router();
const { createBooking, getBookings, deleteBooking} = require('../controllers/bookingController');
const verifyJWT = require('../middlewares/authMiddleware');

router.post('/', verifyJWT, createBooking);
router.get('/', verifyJWT, getBookings);
router.delete('/:id', verifyJWT, deleteBooking);

module.exports = router;
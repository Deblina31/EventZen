const express = require('express');
const router  = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { verifyJWT, requireRole } = require('../middlewares/authMiddleware');

router.post('/', verifyJWT, createBooking);
router.get('/', verifyJWT, getBookings);
router.get('/:id',verifyJWT, getBookingById);
router.patch('/:id/status', verifyJWT, requireRole('ADMIN'), updateBookingStatus);
router.delete('/:id',verifyJWT, cancelBooking);

module.exports = router;
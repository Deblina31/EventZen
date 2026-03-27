const express  = require('express');
const router   = express.Router();
const {
  addFeedback,
  getFeedbackByEvent,
  deleteFeedback
} = require('../controllers/feedbackController');
const { verifyJWT } = require('../middlewares/authMiddleware');

router.post('/', verifyJWT, addFeedback);
router.get('/event/:eventId', verifyJWT, getFeedbackByEvent);
router.delete('/:id', verifyJWT, deleteFeedback);

module.exports = router;
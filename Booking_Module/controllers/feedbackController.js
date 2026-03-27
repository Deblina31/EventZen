const Feedback = require('../models/feedbackModel');
const Booking  = require('../models/bookingModel');
const { asyncHandler } = require('../middlewares/errorMiddleware');
const { body, validationResult } = require('express-validator');

//Validation rules
const feedbackRules = [
  body('eventId').notEmpty().isInt({ gt: 0 }).withMessage('Valid event ID is required'),
  body('rating').notEmpty().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comment').optional().isString().trim(),
];

//POST/ add a feedback
const addFeedback = [
  ...feedbackRules,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { eventId, rating, comment } = req.body;
    const userId = req.user.id;

    //only users who have made a booking can leave feedback
    const booking = await Booking.findOne({
      where: { userId, eventId, status: 'confirmed' }
    });

    if (!booking)
      return res.status(403).json({
        error: 'You can only leave feedback for events you have attended'
      });

    //no duplicate feedback
    const existing = await Feedback.findOne({
      where: { attendeeId: userId, eventId }
    });

    if (existing)
      return res.status(409).json({ error: 'You have already submitted feedback for this event' });

    const feedback = await Feedback.create({
      attendeeId: userId,
      eventId,
      rating,
      comment
    });

    return res.status(201).json(feedback);
  })
];

//GET a feedback by its id 
const getFeedbackByEvent = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findAll({
    where: { eventId: req.params.eventId },
    order: [['createdAt', 'DESC']]
  });

  return res.status(200).json(feedback);
});

//DELETE a feedback
const deleteFeedback = asyncHandler(async (req, res) => {
  const { id: userId, role } = req.user;
  const feedback = await Feedback.findByPk(req.params.id);

  if (!feedback)
    return res.status(404).json({ error: 'Feedback not found' });

  if (role !== 'ADMIN' && feedback.attendeeId !== userId)
    return res.status(403).json({ error: 'Forbidden' });

  await feedback.destroy();
  return res.status(204).send();
});

module.exports = { addFeedback, getFeedbackByEvent, deleteFeedback };
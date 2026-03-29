jest.mock('../models/feedbackModel');
jest.mock('../models/bookingModel');
jest.mock('axios');

const request  = require('supertest');
const express  = require('express');
const jwt      = require('jsonwebtoken');
const Feedback = require('../models/feedbackModel');
const Booking  = require('../models/bookingModel');
const feedbackRoutes = require('../routes/feedbackRoutes');

const app = express();
app.use(express.json());
app.use('/api/v1/feedback', feedbackRoutes);

const makeToken = (userId = 1, role = 'USER') =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET || 'testsecret');

describe('Feedback Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/v1/feedback', () => {

    it('submits feedback for confirmed booking', async () => {
      Booking.findOne.mockResolvedValue({ id: 1, status: 'confirmed' });
      Feedback.findOne.mockResolvedValue(null);
      Feedback.create.mockResolvedValue({
        id: 1, attendeeId: 1, eventId: 5,
        rating: 4, comment: 'Great event overall'
      });
      require('axios').get.mockResolvedValue({ data: { username: 'user1' } });

      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ eventId: 5, rating: 4, comment: 'Great event overall' });

      expect(res.status).toBe(201);
      expect(res.body.rating).toBe(4);
    });

    it('returns 403 when user has no confirmed booking', async () => {
      Booking.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ eventId: 5, rating: 4 });

      expect(res.status).toBe(403);
    });

    it('returns 409 for duplicate feedback', async () => {
      Booking.findOne.mockResolvedValue({ id: 1 });
      Feedback.findOne.mockResolvedValue({ id: 99 }); 

      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ eventId: 5, rating: 3 });

      expect(res.status).toBe(409);
    });

    it('returns 400 when rating out of range', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ eventId: 5, rating: 6 }); 

      expect(res.status).toBe(400);
    });

    it('returns 400 when comment too short', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ eventId: 5, rating: 4, comment: 'Bad' }); 
      expect(res.status).toBe(400);
    });
  });
});
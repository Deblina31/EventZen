const request = require('supertest');
const express = require('express');
const jwt     = require('jsonwebtoken');
require('dotenv').config();

jest.mock('../models/bookingModel');
jest.mock('../models/feedbackModel');
jest.mock('axios');

const Booking  = require('../models/bookingModel');
const axios    = require('axios');
const { verifyJWT } = require('../middlewares/authMiddleware');
const bookingRoutes = require('../routes/bookingRoutes');

const app = express();
app.use(express.json());
app.use('/api/v1/bookings', bookingRoutes);

const makeToken = (userId = 1, role = 'USER') =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET || 'testsecret');

describe('Booking Controller', () => {

  beforeEach(() => jest.clearAllMocks());
  describe('POST /api/v1/bookings', () => {

    it('creates booking for valid request', async () => {
      axios.get.mockResolvedValue({ data: { id: 5, name: 'Test Event' } });
      Booking.create.mockResolvedValue({
        id: 1, userId: 1, eventId: 5,
        ticketType: 'STANDARD', quantity: 2, price: 500,
        status: 'confirmed', paymentStatus: 'paid'
      });

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${makeToken(1, 'USER')}`)
        .send({ eventId: 5, ticketType: 'STANDARD', quantity: 2, price: 500 });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('confirmed');
      expect(res.body.paymentStatus).toBe('paid');
    });

    it('returns 400 when eventId is missing', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ ticketType: 'STANDARD' });

      expect(res.status).toBe(400);
    });

    it('returns 401 when no token provided', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .send({ eventId: 5 });

      expect(res.status).toBe(401);
    });

    it('returns 404 when event does not exist', async () => {
      const error = { response: { status: 404 } };
      axios.get.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ eventId: 999, ticketType: 'STANDARD', price: 500 });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/bookings', () => {

    it('user sees only their own bookings', async () => {
      Booking.findAll.mockResolvedValue([
        { id: 1, userId: 1, eventId: 5 }
      ]);

      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${makeToken(1, 'USER')}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('admin sees all bookings', async () => {
      Booking.findAll.mockResolvedValue([
        { id: 1, userId: 1 },
        { id: 2, userId: 2 }
      ]);

      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${makeToken(99, 'ADMIN')}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {

    it('cancels own booking', async () => {
      Booking.findByPk.mockResolvedValue({
        id: 1, userId: 1, status: 'confirmed',
        update: jest.fn().mockResolvedValue(true)
      });

      const res = await request(app)
        .delete('/api/v1/bookings/1')
        .set('Authorization', `Bearer ${makeToken(1, 'USER')}`);

      expect(res.status).toBe(204);
    });

    it('returns 403 when cancelling someone else\'s booking', async () => {
      Booking.findByPk.mockResolvedValue({
        id: 1, userId: 99, status: 'confirmed',
        update: jest.fn()
      });

      const res = await request(app)
        .delete('/api/v1/bookings/1')
        .set('Authorization', `Bearer ${makeToken(1, 'USER')}`);

      expect(res.status).toBe(403);
    });

    it('returns 404 when booking not found', async () => {
      Booking.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/bookings/999')
        .set('Authorization', `Bearer ${makeToken(1, 'USER')}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 when booking already cancelled', async () => {
      Booking.findByPk.mockResolvedValue({
        id: 1, userId: 1, status: 'cancelled',
        update: jest.fn()
      });

      const res = await request(app)
        .delete('/api/v1/bookings/1')
        .set('Authorization', `Bearer ${makeToken(1, 'USER')}`);

      expect(res.status).toBe(400);
    });
  });
});
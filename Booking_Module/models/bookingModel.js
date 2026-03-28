const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {

  id: {
    type:          DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey:    true,
  },

  userId: {
    type:      DataTypes.BIGINT,
    allowNull: false,
  },

  eventId: {
    type:      DataTypes.BIGINT,
    allowNull: false,
  },

  registrationDate: {
    type:         DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  status: {
    type:         DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'pending',
    allowNull:    false,
  },

  paymentStatus: {
    type:         DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending',
    allowNull:    false,
  },

  ticketType: {
    type:      DataTypes.STRING(50),
    allowNull: true,
  },

  price: {
    type:         DataTypes.DECIMAL(10, 2),
    allowNull:    true,
    defaultValue: 0.00,
  },

  quantity: {
    type:         DataTypes.INTEGER,
    defaultValue: 1,
  },

}, {
  tableName:  'bookings',
  timestamps: true,
  paranoid:   false,
});

module.exports = Booking;
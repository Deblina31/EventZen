const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Feedback = sequelize.define('Feedback', {

  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },

  attendeeId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  eventId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },

  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: 'feedback',
  timestamps: true
});

module.exports = Feedback;
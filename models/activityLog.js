// models/activityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  collection: {
    type: String,
    required: true,
  },
  wineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wine',
  },
  wineName: {
    type: String,
  },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
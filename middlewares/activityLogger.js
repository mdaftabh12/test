// middlewares/activityLogger.js
const ActivityLog = require('../models/activityLog');

const logActivity = async (req, res, next) => {
  try {
    await ActivityLog.create({
      owner: req.user._id, // Associate logs with the current user
      action: req.method,
      collection: 'wine',
      // Other relevant data...
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = logActivity;
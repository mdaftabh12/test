//routes/passwordReset.js
const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Route for sending reset email
router.post('/forgot', passwordResetController.forgotPassword);

// Route for rendering password reset page
router.get('/:token', passwordResetController.renderResetForm);

// Route for resetting the password
router.post('/:token', passwordResetController.resetPassword);

module.exports = router;
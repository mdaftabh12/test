const express = require('express');
const router = express.Router();
const deleteProfileController = require('../controllers/deleteProfileController');

router.post('/delete-profile', deleteProfileController.deleteProfile);
router.post('/delete-profile/verify-otp', deleteProfileController.verifyOtp);

module.exports = router;
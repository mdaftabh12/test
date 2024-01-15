// routes/images.js

// Test the image Upload capability to the server
// curl -X POST -F "image=@/Users/alexforss/Desktop/label.jpg" http://localhost:3000/api/images
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Route for image upload
router.post('/upload', imageController.uploadImage);

module.exports = router;

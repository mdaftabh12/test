//routes/sp500DataRoutes.js
const express = require('express');
const router = express.Router();
const sp500DataController = require('../controllers/sp500DataController');

// Route to fetch S&P 500 data for dashboard
router.get('/dashboard', sp500DataController.fetchSP500Data);

module.exports = router;
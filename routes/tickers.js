//routes/tickers.js
const express = require('express');
const router = express.Router();
const tickersController = require('../controllers/tickersController');

router.get('/', tickersController.fetchStockData);

module.exports = router;
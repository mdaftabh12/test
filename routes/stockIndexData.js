//routes/stockIndexData.js
const express = require('express');
const router = express.Router();
const wineStockIndexController = require('../controllers/wineStockIndexController');

// Route to fetch wine stock index data for dashboard
router.get('/dashboard', wineStockIndexController.fetchWineStockIndexData);

module.exports = router;
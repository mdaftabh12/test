//routes/wines.js
const express = require('express');
const router = express.Router();
const wineController = require('../controllers/wineController');
const passport = require('../config/passport');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const ActivityLog = require('../middlewares/activityLogger');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// CSV import route
router.post('/import-csv', upload.single('csvFile'), wineController.importCSV);

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard'); // Redirect if not authenticated
}

// Protected route
router.get('/protected', isAuthenticated, (req, res) => {
    res.send('This is a protected route');
});

// GET all wines
router.get('/', wineController.getAllWines);

// POST a new wine
router.post('/', wineController.createWine);

// PUT route to update a wine by ID
router.put('/:id', wineController.updateWine);

// DELETE route to delete a wine by ID
router.delete('/:id', wineController.deleteWine);

// POST route to add a wine to user's wine_catalog by name
router.post('/wines/addToCatalogByName', wineController.addWineToCatalogByName);

// POST route to update a user's profile details
router.post('/updateProfile', wineController.updateProfile);

// Create a route to get all wines from WineDatabase
router.get('/wines/all', async (req, res) => {
  try {
    const allWines = await WineDatabase.find();
    res.json(allWines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - QUERY AGAINST WINE_DATABASE FOR AUTOCOMPLETE
router.get('/wines/autocomplete', wineController.autocompleteWines);

// GET - QUERY FOR ID VALUE WITHIN WINE_DATABASE
router.get('/details/:id', async (req, res) => {
    const wineId = req.params.id;

    try {
        const selectedWine = await WineDatabase.findById(wineId);

        if (!selectedWine) {
            return res.status(404).json({ error: 'Wine not found in WineDatabase' });
        }

        res.status(200).json(selectedWine);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wine details', message: error.message });
    }
});

// GET - SEARCH FOR WINE
router.get('/wines/search', wineController.searchWines);

// GET route to calculate total wine value
router.get('/totalWineValue', wineController.getTotalWineValue);

// New route to get total count of wines
router.get('/totalCount', wineController.getTotalWineCount);

// Route to render dashboard.html at '/dashboard'
router.get('/dashboard', (req, res) => {
    res.render('dashboard'); // Assuming 'dashboard' is the name of your dashboard HTML file
});

// GET - COLLECTION PAGE & SEARCH QUERY
router.get('/collection', (req, res) => {
    const searchQuery = req.query['name']; // Get the query parameter

    // Render the collection page and pass the query parameter to the frontend
    res.render('collection', { searchQuery });
});

// Route to get wine price distribution without authentication
router.get('/price-distribution', wineController.getWinePriceDistribution);

// Route to get the price per bottle
router.get('/price-per-bottle', wineController.getPricePerBottle);

// Route to get wine variety distribution without authentication
router.get('/variety-distribution', wineController.getWineVarietyDistribution);

// Apply the logActivity middleware to relevant routes
router.post('/wines', ActivityLog, wineController.createWine);
router.put('/wines/:id', ActivityLog, wineController.updateWine);
router.delete('/wines/:id', ActivityLog, wineController.deleteWine);

// Fetch activity logs specific to the logged-in user
router.get('/dashboard/activity-logs', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID
    const logs = await ActivityLog.find({ owner: userId }).sort({ timestamp: -1 });

    res.json(logs); // Send logs associated with the current user as a JSON response
  } catch (error) {
    console.error('Error in route:', error); // Add this line
    res.status(500).json({ error: 'Error fetching logs' });
  }
});

module.exports = router;
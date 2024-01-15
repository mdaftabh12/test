//controllers/wineController.js
const { Wine, WineDatabase } = require('../models/wine');
const ActivityLog = require('../models/activityLog'); // Import the activity log model
const activityLogger = require('../middlewares/activityLogger'); // Import the activity logger middleware
const csv = require('csv-parser');
const fs = require('fs');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');

// Create a new wine associated with the logged-in user
exports.createWine = async (req, res) => {
  try {
    const newWine = await Wine.create({
      name: req.body.name,
      region: req.body.region,
      price: req.body.price,
      year: req.body.year,
      varietal: req.body.varietal,
      type: req.body.type,
      winery: req.body.winery,
      country: req.body.country,
      size: req.body.size,
      owner: req.user._id, // Assuming req.user holds the logged-in user's information
    });

    await ActivityLog.create({
      owner: req.user._id,
      action: 'added',
      collection: 'wine',
      wineId: newWine._id,
      wineName: newWine.name,
    });
    
    res.status(201).json(newWine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all wines associated with the logged-in user
exports.getAllWines = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id });
    res.json(wines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing wine by logged in user
exports.updateWine = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedWine = await Wine.findOneAndUpdate(
      { _id: id, owner: req.user._id }, // Make sure only the owner can update their wine
      req.body,
      { new: true }
    );
    if (!updatedWine) {
      return res.status(404).json({ message: 'Wine not found' });
    }

    // Log activity for wine update
    await ActivityLog.create({
      owner: req.user._id,
      action: 'updated',
      collection: 'wine',
      wineId: updatedWine._id, // Include the updated wine's ID
      wineName: updatedWine.name, // Include the name for quick reference
    });

    res.json(updatedWine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE PROFILE DETAILS INC. PROFILE IMAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // Define the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Generate unique filenames with original extensions
  },
});
const upload = multer({ storage: storage }).single('profileImage');

exports.updateProfile = async (req, res, next) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error('Error uploading image:', err);
        return res.status(500).json({ error: 'Error uploading image' });
      }

      if (req.isAuthenticated()) {
        const { firstName, lastName } = req.body;

        // Ensure both firstName and lastName are present in the request body
        if (!firstName || !lastName) {
          return res.status(400).json({ error: 'Both first name and last name are required.' });
        }

        const userId = req.user._id;

        // Get the file path or URL where the image is saved (assuming it's in the 'public/uploads' directory)
        const imagePath = req.file ? '/uploads/' + req.file.filename : '';

        // Update user details in the database, including the image path
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { firstName, lastName, profileImage: imagePath },
          { new: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ error: 'User not found.' });
        }

        // Redirect to the profile page upon successful update
        return res.redirect('/editprofile'); // Adjust the URL as needed
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a wine by ID (only if the user is the owner)
exports.deleteWine = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedWine = await Wine.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!deletedWine) {
      return res.status(404).json({ message: 'Wine not found' });
    }

    // Log activity for wine deletion
    await ActivityLog.create({
      owner: req.user._id,
      action: 'deleted',
      collection: 'wine',
      wineId: deletedWine._id, // Include the deleted wine's ID
      wineName: deletedWine.name, // Include the name for quick reference
    });

    res.json({ message: 'Wine deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET WINE DETAILS BY ID
exports.getWineDetailsById = async (req, res) => {
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
};

// Search Wines
exports.searchWines = async (req, res) => {
  const searchParams = req.query;
  const queryConditions = buildSearchQuery(searchParams);

  try {
    const wines = await WineDatabase.find(queryConditions).limit(10);

    if (!wines || wines.length === 0) {
      return res.status(404).json({ message: 'No wines found matching the search criteria' });
    }

    res.json(formatResponse(wines));
  } catch (error) {
    console.error('Error fetching wines:', error);
    res.status(500).json({ error: 'Error fetching wines', message: error.message });
  }
};

// Function to build search query conditions
const buildSearchQuery = (searchParams) => {
  const queryConditions = {};

  if (searchParams.name) {
    queryConditions.name = { $regex: searchParams.name, $options: 'i' };
  }
  if (searchParams.region) {
    queryConditions.region = { $regex: searchParams.region, $options: 'i' };
  }
  if (searchParams.varietal) {
    queryConditions.varietal = { $regex: searchParams.varietal, $options: 'i' };
  }
  if (searchParams.price) {
    queryConditions.price = { $gte: parseFloat(searchParams.price) };
  }
  if (searchParams.year) {
    queryConditions.year = { $gte: parseFloat(searchParams.year) };
  }
  if (searchParams.type) {
    queryConditions.type = { $regex: searchParams.type, $options: 'i' };
  }
  if (searchParams.winery) {
    queryConditions.winery = { $regex: searchParams.winery, $options: 'i' };
  }
  if (searchParams.country) {
    queryConditions.country = { $regex: searchParams.country, $options: 'i' };
  }
  if (searchParams.size) {
    queryConditions.size = { $regex: searchParams.size, $options: 'i' };
  }

  return queryConditions;
};

// Function to format response
const formatResponse = (wines) => {
  return wines.map((wine) => ({
    name: wine.name,
    region: wine.region,
    varietal: wine.varietal,
    price: wine.price,
    year: wine.year,
    type: wine.type,
    winery: wine.winery,
    country: wine.country,
    size: wine.size,
    // Include other necessary fields...
  }));
};

// Autocomplete search for wines in wine_catalog collection
exports.autocompleteWines = async (req, res) => {
  try {
    let query = req.query.q;
    const owner = req.user._id;

    if (typeof query !== 'string') {
      query = String(query);

      if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Invalid query format', message: 'Query must be a non-empty string' });
      }
    }

    const stringConditions = {
      owner: owner,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { region: { $regex: query, $options: 'i' } },
        { price: { $regex: query, $options: 'i' } },
        { year: { $regex: query, $options: 'i' } },
        { varietal: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } },
        { winery: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } },
        { size: { $regex: query, $options: 'i' } },
      ],
    };

    const stringBasedWines = await Wine.find(stringConditions).limit(10);

    const formattedData = stringBasedWines.map((wine) => ({
      name: wine.name,
      region: wine.region,
      price: wine.price,
      year: wine.year,
      varietal: wine.varietal,
      type: wine.type,
      winery: wine.winery,
      country: wine.country,
      size: wine.size,
      // Include other necessary fields...
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Autocomplete error', message: error.message });
  }
};

// Function to add a wine to user's wine_catalog by name
exports.addWineToCatalogByName = async (req, res) => {
    try {
        const { name, region, price, year, varietal, type, winery, country, size, quantity } = req.body;

        if (!price || !varietal || !year || !size || !quantity) {
            return res.status(400).json({ error: 'Please fill in all editable fields, including quantity.' });
        }

        const winesToAdd = [];
        for (let i = 0; i < quantity; i++) {
            const wineToAdd = {
                name: name || '', 
                region: region || '', 
                price,
                year,
                varietal,
                type: type || '',
                winery: winery || '',
                country: country || '',
                size,
                owner: req.user._id,
            };
            winesToAdd.push(wineToAdd);
        }

        // Add the wines to the wine_catalog collection
        const savedWines = await Wine.insertMany(winesToAdd);

        // Log activity for adding wines
        savedWines.forEach(async (savedWine) => {
            await ActivityLog.create({
                owner: req.user._id,
                action: 'added',
                collection: 'wine',
                wineId: savedWine._id,
                wineName: savedWine.name,
            });
        });

        res.status(200).json(savedWines);
    } catch (error) {
        console.error('Error adding wine to wine_catalog:', error);
        res.status(500).json({ error: 'Failed to add wine(s) to wine_catalog', message: error.message });
    }
};

// GET TOTAL PRICE FOR LOGGED IN USER WINE COLLECTION
exports.getTotalWineValue = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id }, 'price');
    const totalValue = wines.reduce((acc, wine) => acc + wine.price, 0);
    res.json({ totalValue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate the total count of wines belonging to the logged-in user
exports.getTotalWineCount = async (req, res) => {
  try {
    const totalCount = await Wine.countDocuments({ owner: req.user._id });
    res.json({ totalWineCount: totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate wine price distribution
exports.getWinePriceDistribution = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id }, 'price');

    const priceRanges = {
      '0-20': 0,
      '21-50': 0,
      '51-80': 0,
      '81-100': 0,
      '101-200': 0,
      '201-500': 0,
      '501-1000': 0,
      '1000+': 0,
    };

    wines.forEach(wine => {
      const price = wine.price;

      if (price >= 0 && price <= 20) {
        priceRanges['0-20']++;
      } else if (price >= 21 && price <= 50) {
        priceRanges['21-50']++;
      } else if (price >= 51 && price <= 80) {
        priceRanges['51-80']++;
      } else if (price >= 81 && price <= 100) {
        priceRanges['81-100']++;
      } else if (price >= 101 && price <= 200) {
        priceRanges['101-200']++;
      } else if (price >= 201 && price <= 500) {
        priceRanges['201-500']++;
      } else if (price >= 501 && price <= 1000) {
        priceRanges['501-1000']++;
      } else {
        priceRanges['1000+']++;
      }
    });

    res.json(priceRanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get the average price per bottle of wines
exports.getPricePerBottle = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id }, 'price');
    const prices = wines.map(wine => wine.price); // Extract prices into an array

    // Get the price per bottle by finding the average of all prices
    const pricePerBottle = prices.length ? (prices.reduce((acc, price) => acc + price, 0) / prices.length) : 0;

    res.json({ pricePerBottle: pricePerBottle.toFixed(2) }); // Return the price per bottle
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate wine variety distribution
exports.getWineVarietyDistribution = async (req, res) => {
  try {
    const wines = await Wine.find({ owner: req.user._id }, 'varietal');

    const varietyCounts = {};

    wines.forEach(wine => {
      const variety = wine.varietal;

      if (!varietyCounts[variety]) {
        varietyCounts[variety] = 1;
      } else {
        varietyCounts[variety]++;
      }
    });

    res.json(varietyCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FUNCTION TO HANDLE BULK CSV IMPORT
exports.importCSV = async (req, res) => {
  try {
    // Checking if a file is present and if it's a CSV file
    if (!req.file || req.file.mimetype !== 'text/csv') {
      return res.status(400).send('Please upload a CSV file.');
    }

    const results = [];
    // Reading the uploaded CSV file and processing it using the 'csv-parser' library
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data)) // Collecting parsed CSV data
      .on('end', async () => {
        // Processing the parsed CSV data and saving to the database
        for (const wineData of results) {
          // Modifying the wine data to include the owner field (assuming req.user holds the logged-in user's information)
          wineData.owner = req.user._id;

          // Creating a new Wine object and saving it to the database
          const newWine = new Wine(wineData);
          await newWine.save();
        }

        // Sending success response after importing all wines
        res.status(200).send('CSV data imported successfully.');
      });
  } catch (err) {
    // Handling any errors that occur during the process
    res.status(500).send('Error importing CSV data.');
  }
};

// Fetch logs for the current user
exports.getActivityLogs = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find({ owner: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(activityLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
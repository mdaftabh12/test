//models/wine.js
const mongoose = require('mongoose');

// Schema for the wine_catalog collection
const wineSchema = new mongoose.Schema({
  name: String,
  region: String,
  price: Number,
  year: Number,
  varietal: String,
  type: String,
  winery: String,
  country: String,
  size: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cellarType: String,
  rackType: String,
  binType: String,
  bottleSlots: { columns: Number, rows: Number, depth: Number }, // Slots configuration
});

// Model mapped to the wine_catalog collection
const Wine = mongoose.model('Wine', wineSchema, 'wine_catalog');

// Schema for the wine_database collection
const wineDatabaseSchema = new mongoose.Schema({
  name: String,
  region: String,
  varietal: String,
  type: String,
  winery: String,
  country: String,
  price: Number,
  year: Number,
  size: String,
});

// Model mapped to the wine_database collection
const WineDatabase = mongoose.model('WineDatabase', wineDatabaseSchema, 'wine_database');

module.exports = { Wine, WineDatabase };
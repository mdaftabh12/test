//controllers/tickersController.js
const axios = require('axios');

const fetchStockData = async (req, res) => {
  try {
    const apiKey = '5cb69adef17ba50ae59e647e78860857';
    const apiUrlSTZ = `http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=STZ`;
    const apiUrlLVMUY = `http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=LVMUY`;
    const apiUrlPDRDF = `http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=PDRDF`;
    const apiUrlDEO = `http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=DEO`;

    // Making GET requests to Marketstack API for all four stocks
    const responseSTZ = await axios.get(apiUrlSTZ);
    const responseLVMUY = await axios.get(apiUrlLVMUY);
    const responsePDRDF = await axios.get(apiUrlPDRDF);
    const responseDEO = await axios.get(apiUrlDEO);

    // Log fetched data for debugging purposes
    console.log('STZ Data:', responseSTZ.data);
    console.log('LVMUY Data:', responseLVMUY.data);
    console.log('PDRDF Data:', responsePDRDF.data);
    console.log('DEO Data:', responseDEO.data);

    // Construct the response object containing data for all four stocks
    const stockData = {
      STZ: responseSTZ.data.data[0],
      LVMUY: responseLVMUY.data.data[0],
      PDRDF: responsePDRDF.data.data[0],
      DEO: responseDEO.data.data[0],
    };

    // Sending the retrieved data back to the client
    res.json(stockData);
  } catch (error) {
    // Handling errors
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchStockData,
};
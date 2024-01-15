//controllers/wineStockIndexController.js
exports.fetchWineStockIndexData = async (req, res) => {
    try {
        const wineStockIndexData = [
          { date: 'Jan 2004', value: 52 },
          { date: 'Jan 2006', value: 76 },
          { date: 'Jan 2008', value: 84 },
          { date: 'Jan 2010', value: 132 },
          { date: 'Jan 2012', value: 194 },
          { date: 'Jan 2014', value: 164 },
          { date: 'Jan 2016', value: 173 },
          { date: 'Jan 2018', value: 228 },
          { date: 'Jan 2020', value: 267 },
          { date: 'Jan 2022', value: 324 }
        ];
        
        res.json(wineStockIndexData); // Return the correct variable 'wineStockIndexData'
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

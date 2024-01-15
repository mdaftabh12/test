//controllers/sp500DataController.js
exports.fetchSP500Data = async (req, res) => {
    try {
        const sp500Data = [
          { date: 'Jan 2004', value: 50 },
          { date: 'Jan 2006', value: 80 },
          { date: 'Jan 2008', value: 72 },
          { date: 'Jan 2010', value: 74 },
          { date: 'Jan 2012', value: 72 },
          { date: 'Jan 2014', value: 98 },
          { date: 'Jan 2016', value: 108 },
          { date: 'Jan 2018', value: 112 },
          { date: 'Jan 2020', value: 149 },
          { date: 'Jan 2022', value: 229 }
        ];
        
        res.json(sp500Data); // Return the correct variable 'data'
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
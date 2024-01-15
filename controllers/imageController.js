// controllers/imageController.js
const Wine = require('../models/wine');

exports.uploadImage = (req, res) => {
    console.log('Received image upload request.');

    // Process the uploaded image data and interact with the MongoDB database
    const { wineImage } = req.files; // Assuming Multer middleware is used

    console.log('Processing image data...');

    // Example: Save image data to a file (you may want to handle this differently)
    const imagePath = path.join(__dirname, '../public/images', 'capturedImage.jpg');

    fs.writeFile(imagePath, wineImage.data, 'base64', function (err) {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }

        console.log('Image saved successfully.');

        // Example: Log the file path for verification
        console.log('Image path:', imagePath);

        // Example: Query MongoDB to check if the wine is already in the collection
        Wine.findOne({ name: 'ExampleWine' }, (err, wine) => {
            if (err) {
                console.error('Error querying MongoDB:', err);
                return res.status(500).json({ success: false, error: 'Internal Server Error' });
            }

            console.log('MongoDB query completed.');

            if (wine) {
                console.log('Wine found in the database:', wine);
                return res.json({ success: true, message: 'Wine found in the database', wine });
            } else {
                console.log('Wine not found in the database');
                return res.json({ success: true, message: 'Wine not found in the database' });
            }
        });
    });
};
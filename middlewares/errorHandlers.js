// middleswares/errorHandlers.js
const express = require('express');
const errorHandlers = require('./middlewares/errorHandlers');

const app = express();

if (!user) {
    return done(null, false, { message: 'Incorrect email.' });
}

const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
    return done(null, false, { message: 'Incorrect password. Please try again.' });
}

return done(null, user);

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
}

module.exports = errorHandler;

// Define your routes
app.use('/api', require('./routes/auth')); // Assuming your authentication routes are in 'routes/auth.js'

// Use the error handling middleware
app.use(errorHandlers); // Applying the error handling middleware

// ... (listen to port, start server, etc.)

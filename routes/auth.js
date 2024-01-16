// routes/auth
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const wineController = require('../controllers/wineController');

// Register a new user
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        const emailPattern =  /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if(!emailPattern.test(email)) {
            return res.status(400).json({message: 'Please enter valid email address.'});
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User with this email already exists');
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password for Registration:', hashedPassword);

        // Create a new user object including first and last names
        const newUser = new User({ username, email, password: hashedPassword, firstName, lastName });

        // Save the new user to the database
        const savedUser = await newUser.save();

        if (!savedUser) {
            console.error('User not saved');
            return res.status(500).json({ message: 'User registration failed' });
        }

        req.login(savedUser, async (err) => {
            if (err) {
                console.error('Error logging in after registration:', err);
                return next(err);
            }

            try {
                savedUser.isNewUser = true;
                await savedUser.save();
            } catch (updateError) {
                console.error('Error updating isNewUser flag:', updateError);
                // Handle error if needed
            }

            // Redirect to /dashboard upon successful registration and login
            res.redirect('/dashboard');
        });
    } catch (err) {
        console.error('Error during registration:', err);
        next(err);
    }
});

// CUSTOM LOGIN
router.post('/custom-login', async (req, res, next) => {
    try {
        console.log('Login Route Reached');
        const { email, password } = req.body;
        console.log('Input Email:', email);

        // Check if the user exists
        const user = await User.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } }).collation({ locale: 'en', strength: 2 });
        console.log('Queried user:', user);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'User not found' });
        }

        console.log('Stored Password:', user.password);
        console.log('Entered Password:', password);

        // Check if the entered password is valid
        const isPasswordValid = await user.comparePassword(password);
        console.log('Is Password Valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Incorrect password');
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // The password is valid, proceed with login
        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error('Error during login:', loginErr);
                return next(loginErr);
            }

            console.log('Login successful:', user.email);

            // Redirect to /dashboard upon successful login
            return res.redirect('/dashboard');
        });
    } catch (error) {
        console.error('Error during custom login:', error);
        return next(error);
    }
});

// Define the route handler for updating the profile
router.post('/updateProfile', wineController.updateProfile);

// Logout route
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
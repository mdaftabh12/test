// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        console.log('Input Email:', email); // Log received email

        const user = await User.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } });

        console.log('Queried user:', user); // Log the user object fetched from the database

        if (!user) {
            return done(null, false, { message: 'User not found.' });
        }

        console.log('Stored Hash:', user.password);
        console.log('Entered Password:', password);

        const isPasswordValid = await user.comparePassword(password.trim());

        console.log('Is Password Valid:', isPasswordValid);

        if (!isPasswordValid) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    } catch (error) {
        console.error('Passport local strategy error:', error); // Log any error that occurs
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const deserializedUser = await User.findById(id);

        if (deserializedUser) {
            // Check if the user is considered a new user
            if (deserializedUser.isNewUser) {
                // Update the flag to indicate that the user is no longer new
                deserializedUser.isNewUser = false;
                await deserializedUser.save();
            }
            console.log('Deserialized User:', deserializedUser);
        }

        done(null, deserializedUser);
    } catch (error) {
        console.error('Error during deserialization:', error);
        done(error, null);
    }
});

module.exports = passport;
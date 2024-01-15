// index.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const User = require('./models/user');
const cors = require('cors');
const authRouter = require('./routes/auth');
const wineRouter = require('./routes/wines');
const ActivityLog = require('./models/activityLog');
const wineStockIndexRoutes = require('./routes/stockIndexData');
const sp500DataRoutes = require('./routes/sp500DataRoutes');
const wineController = require('./controllers/wineController');
const passwordResetRouter = require('./routes/passwordReset');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection setup
//mongoose.connect('mongodb+srv://gforss8:<<passwprd>>@cluster0.rtbm8rp.mongodb.net/test?retryWrites=true&w=majority', {
//  useNewUrlParser: true,
//  useUnifiedTopology: true,
//});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'wine',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Mounted the authentication routes
app.use('/auth', authRouter);

// Define isAuthenticated middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// MongoDB Connection
// const dbConnection = mongoose.connection;
// dbConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));
// dbConnection.once('open', () => {
//   console.log('Connected to MongoDB');
// });

mongoose
  .connect("mongodb://0.0.0.0:27017/test-project")
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log(error.message);
  });

const tickersRoute = require('./routes/tickers');

// SERVE PRE-AUTHENTICATED PAGES
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/password_reset_request', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'password_reset_request.html'));
});

app.get('/password_reset', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'password_reset.html'));
});

app.get('/password_reset/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'password_reset.html'));
});

// SERVE POST-AUTHENTICATED PAGES
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/collection', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'collection.html'));
});

app.get('/editprofile', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'editprofile.html'));
});

app.get('/importwine', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'importwine.html'));
});

app.get('/cellarlocate', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cellarlocate.html'));
});

// Handle login form submission using Passport.js
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard', // Redirect to '/' after successful login
  failureRedirect: '/login', // Redirect back to login if authentication fails
}));

// Endpoint to fetch user data including profileImage
app.get('/api/user', async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const userId = req.user._id;

      // Fetch user data including the profileImage field
      const userDataWithProfileImage = await User.findById(userId).select('username firstName lastName email profileImage');

      if (!userDataWithProfileImage) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Send the updated user data in the response
      return res.json(userDataWithProfileImage);
    } else {
      return res.status(401).json({ error: 'User is not authenticated' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// SERVE ACTIVITY LOGS
app.get('/dashboard/activity-logs', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID
    const logs = await ActivityLog.find({ owner: userId }).sort({ timestamp: -1 });

    res.json(logs); // Send logs associated with the current user as a JSON response
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Error fetching logs' });
  }
});

// Routes
app.use('/wines/search', wineController.searchWines);
app.use('/wines/autocomplete', wineController.autocompleteWines);
app.use('/wines', isAuthenticated, wineRouter);
app.use('/stock', isAuthenticated, wineStockIndexRoutes);
app.use('/sp500', isAuthenticated, sp500DataRoutes);
app.use('/wines/addToCatalogByName', isAuthenticated, wineController.addWineToCatalogByName);
app.use('/password', passwordResetRouter);
app.use('/tickers', tickersRoute);
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/api/images', imageRoutes);

// Move express.static middleware here
app.use(express.static(path.join(__dirname, 'public')));

// Handle registration form submission
app.post('/register', async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body; 

  try {
    const newUser = new User({ username, email, password, firstName, lastName });
    await newUser.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Registration failed. Please try again.');
  }
});

// Add the isAuthenticated function before defining routes
function isAuthenticated(req, res, next) {
  const excludedRoutes = ['/password_reset_request', '/password_reset'];

  if (excludedRoutes.includes(req.path)) {
    return next();
  }

  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// The wildcard route should be at the end
app.get('*', (req, res) => {
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
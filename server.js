const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');

// Routes
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const {loadHome} = require('./controllers/userController');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/aura', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));

// Express middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Register custom 'eq' helper
hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static('public'));

// Use routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/', loadHome);

// Start server
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

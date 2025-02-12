const express = require('express');

const mongoose = require('mongoose');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');


const dotenv = require("dotenv")
const nocache=require("nocache")
const app = express();
app.use(nocache())

const passport = require('./middleware/passport')




// Routes
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/aura')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));


// Express middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));




// Session middleware
app.use(session({
    secret:"mysecretkey",
    resave:false,
    saveUninitialized:true,
    cookie:{
    maxAge:100*60*60*24
    }
}))



// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());




// Register custom 'eq' helper
hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static('public'));

// Register the custom Handlebars helper for calculating offer price
hbs.registerHelper('calculateOfferPrice', function(price, discount) {
    const offerPrice = price - (price * discount / 100);
    return offerPrice.toFixed(); // Adjust the decimal places as needed
  });



hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Use routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/', userRoutes);


// Start server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

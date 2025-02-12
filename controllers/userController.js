const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const Category = require('../models/category');

const Product = require('../models/product');

const passport = require("../middleware/passport")






// Google authentication route
const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
  });
  
  const googleAuthCallback = (req, res) => {
    const user = req.user; // The authenticated user will be attached to `req.user`
  
    console.log('User authenticated via Google:', user);
  
    // Check if the user already exists in the database
    User.findOne({ email: user.emails[0].value })
      .then(existingUser => {
        if (existingUser) {
          // User exists, log them in
          req.session.user = existingUser;
          return res.render('user/home', { user: existingUser }); // Pass the user object to the home page
        } else {
          // Create a new user if doesn't exist
          const newUser = new User({
            fullName: user.displayName,
            email: user.emails[0].value,
            mobile: '', // Set the mobile field based on your use case
            password: '', // Set the password field if needed or handle it differently
          });
  
          newUser.save()
            .then(savedUser => {
              req.session.user = savedUser;
              return res.render('user/home', { user: savedUser }); // Pass the new user object to the home page
            })
            .catch(err => {
              console.error('Error saving user:', err);
              res.redirect('/user/login'); // Redirect to login page if error occurs
            });
        }
      })
      .catch(err => {
        console.error('Error checking user:', err);
        res.redirect('/user/login');
      });
  };
  
  
  // Google authentication failure route
  const failure = (req, res) => {
    res.redirect('/user/login'); // Redirect to the login page if authentication fails
  };


// Register a new user
const registerUser = async (req, res) => {
    const { fullName, mobile, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('user/register', { message: 'Email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Store user details and OTP in session
        req.session.userDetails = { fullName, mobile, email, password: hashedPassword };
        req.session.otp = otp;

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sarath91600@gmail.com',
                pass: 'vavo cqra matf covp', 
            },
        });

        const mailOptions = {
            from: 'sarath91600@gmail.com',
            to: email,
            subject: 'OTP for Aura Perfumes Registration',
            text: `Your OTP is: ${otp}`,
        };

        // Send OTP email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.render('user/register', { error: 'Failed to send OTP. Please try again.' });
            } else {
                console.log('Email sent:', info.response);
                res.redirect('/user/otp');
            }
        });
    } catch (error) {
        console.error('Error in registration:', error);
        res.render('user/register', { error: 'Something went wrong. Please try again later.' });
    }
};

// Resend OTP
const resendOtp = async (req, res) => {
    try {
        // Generate a new 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Update OTP in session
        req.session.otp = otp;

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sarath91600@gmail.com',
                pass: 'vavo cqra matf covp', // Replace with your app password
            },
        });

        const mailOptions = {
            from: 'sarath91600@gmail.com',
            to: req.session.userDetails.email,
            subject: 'New OTP for Aura Perfumes Registration',
            text: `Your new OTP is: ${otp}`,
        };

        // Send new OTP email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.json({ success: false, message: 'Failed to resend OTP. Please try again.' });
            } else {
                console.log('New OTP email sent:', info.response);
                res.json({ success: true });
            }
        });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.json({ success: false, message: 'Failed to resend OTP. Please try again later.' });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    const { otp } = req.body;

    // Debugging Logs
    console.log('Entered OTP:', otp);
    console.log('Stored OTP:', req.session.otp);

    // Compare entered OTP with stored OTP (convert both to strings)
    if (otp === req.session.otp.toString()) {
        console.log('OTP verified successfully!');

        // Retrieve user details from session
        const userDetails = req.session.userDetails;

        // Save the user to the database
        try {
            const newUser = new User(userDetails);
            await newUser.save();
            console.log('User saved to database:', newUser);
             // Store user session
             req.session.user = {
              fullName: newUser.fullName,
              email: newUser.email,
          };

            // Clear session data
            req.session.otp = null;
            //req.session.userDetails = null;

            // Redirect to home page
            res.redirect('/user/home');
        } catch (error) {
            console.error('Error saving user to database:', error);
            res.render('user/otp', { error: 'Failed to save user. Please try again later.' });
        }
    } else {
        console.log('Invalid OTP entered.');
        res.render('user/otp', { error: 'Invalid OTP. Please try again.' });
    }
};

// Login function
const login = async (req, res) => {
    try {
        if (req.session.user) {
            return res.redirect('/user/home');
        }

        const { email, password } = req.body;

       

        if (!email || !password) {
            return res.render('user/login', { message: 'All fields are required' });
        }

        const user = await User.findOne({ email });

        console.log('User found:', user);

        if (!user) {
            return res.render('user/login', { message: 'No user found' });
        }

        // Check if the user's status is active
        if (user.status !== 'Active') {
            return res.render('user/login', { message: 'Sorry our account is blocked. Please contact admin.aura@gamil.com' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.render('user/login', { message: 'Incorrect password' });
        }

        req.session.user = user;

        console.log('User session set:', req.session.user);

        res.redirect('/user/home');
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send('Server Error');
    }
};









  
const loadHome = async (req, res) => {
  console.log('User session in loadHome:', req.session.user); // Debugging step
  res.render('user/home', { user: req.session.user });
};


// Render OTP verification page
const getOtpPage = (req, res) => {
    res.render('user/otp');
};

// Render login page
const getLoginPage = (req, res) => {
    res.render('user/login');
};





const getCategoriesForUser = async (req, res) => {
  try {
      // Fetch categories that are not marked as deleted
      const categories = await Category.find({ deleted: false });

      // Fetch the latest 4 products
      const newProducts = await Product.find({ isDeleted: false })
          .sort({ createdAt: -1 })  // Sort by the creation date in descending order
          .limit(4); // Limit to 4 products

      // Get the logged-in user from the session (if available)
      const user = req.session.user;

      // Render the home page with the categories, new products, and user data
      res.render('user/home', { user, categories, newProducts });

  } catch (error) {
      console.error('Error fetching categories and products for user:', error);
      res.status(500).send('Server error');
  }
};



const getCategoryProducts = async (req, res) => {
    const categoryName = req.params.categoryName;
  
    try {
      // Find the category by name
      const category = await Category.findOne({ name: categoryName });
  
      if (category) {
        // Find the products associated with this category
        const products = await Product.find({ category: category._id });
  
        // Render product page with the category and the associated products
        res.render('user/product', { category, products });
      } else {
        res.status(404).send('Category not found');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).send('Server Error');
    }
  };
  

  // Function to get product details
const getProductDetail = async (req, res) => {
    try {
      const productId = req.params.id;
  
      // Fetch the product details
      const product = await Product.findById(productId)
        .populate('category') // If you want to get category info
        .exec();
  
      if (!product) {
        return res.status(404).render('404', { message: 'Product not found' });
      }
  
      // Fetch related products (same category)
      const relatedProducts = await Product.find({ category: product.category._id, _id: { $ne: product._id } }).limit(4).exec();
  
      // Render the product detail page
      res.render('user/productDetailedPage', {
        product,
        relatedProducts,
        calculateOfferPrice: (price, discount) => price - (price * discount / 100) // Helper function to calculate the offer price
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  };


  // Controller function to get the latest 4 products
const getNewCollections = async (req, res) => {
    try {
      // Find the latest 4 products, sorted by the most recent added
      const newProducts = await Product.find({ isDeleted: false }) // Exclude deleted products
        .sort({ createdAt: -1 }) // Sort by the creation date in descending order
        .limit(4); // Limit to 4 products
  
      // Render the page and pass the newProducts to the template
      res.render('user/home', { newProducts });
    } catch (error) {
      console.error('Error fetching new products:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };


  const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Failed to log out");
        }
        res.clearCookie("connect.sid", { path: "/" });
        res.redirect("/user/home");
    });
};

module.exports = { registerUser, getOtpPage, verifyOtp, loadHome, login, getLoginPage, resendOtp,getCategoriesForUser,logout,googleAuthCallback,failure,googleAuth,getCategoryProducts,getProductDetail,getNewCollections };
    
    

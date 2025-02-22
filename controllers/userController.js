const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const Category = require('../models/category');
const passport = require('../middleware/passport');
const Product = require('../models/product');


// // Google login handler
// const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// // Google callback handler
// const googleCallback = (req, res, next) => {
//     passport.authenticate('google', { failureRedirect: '/user/login' }, (err, user, info) => {
//         if (err || !user) {
//             return res.redirect('/user/login');
//         }
//         req.session.user = user;
//         res.redirect('/user/home');
//     })(req, res, next);
// };

// // Logout handler
// const googleLogout = (req, res) => {
//     req.logout(() => {
//         req.session.destroy((err) => {
//             if (err) {
//                 return res.status(500).send('Error logging out.');
//             }
//             res.redirect('/user/home');
//         });
//     });
// };






// Register a new user
// // Register a new user
// const registerUser = async (req, res) => {
//     const { fullName, mobile, email, password } = req.body;
   
//     const redirectUrl = req.query.redirect || "/user/home"; // Default to home
//     req.session.redirect = redirectUrl;

//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.render('user/register', { message: 'Email already exists.' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const otp = Math.floor(1000 + Math.random() * 9000);

//         req.session.userDetails = { fullName, mobile, email, password: hashedPassword };
//         req.session.otp = otp;
//         req.session.redirect = redirectUrl;  
//         console.log("haaaaa",redirectUrl);
//         console.log("haaaaa",req.session.redirect);
//         // Store redirect URL in session

//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: { user: 'sarath91600@gmail.com', pass: 'vavo cqra matf covp' },
//         });

//         const mailOptions = {
//             from: 'sarath91600@gmail.com',
//             to: email,
//             subject: 'OTP for Aura Perfumes Registration',
//             text: `Your OTP is: ${otp}`,
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log('Error sending email:', error);
//                 return res.render('user/register', { error: 'Failed to send OTP. Please try again.' });
//             } else {
//                 console.log('Email sent:', info.response);
//                 // 🔹 Pass the redirect parameter to the OTP page
//                 res.redirect(`/user/otp?redirect=${encodeURIComponent(redirectUrl)}`);
//             }
//         });
//     } catch (error) {
//         console.error('Error in registration:', error);
//         res.render('user/register', { error: 'Something went wrong. Please try again later.' });
//     }
// };

const registerUser = async (req, res) => {
    const { fullName, mobile, email, password } = req.body;
    const redirectUrl = req.body.redirect || req.query.redirect || "/user/home"; // 🔹 Get correct redirect

    req.session.redirect = redirectUrl;  // 🔹 Store redirect in session

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('user/register', { message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(1000 + Math.random() * 9000);

        req.session.userDetails = { fullName, mobile, email, password: hashedPassword };
        req.session.otp = otp;

        

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: 'sarath91600@gmail.com', pass: 'vavo cqra matf covp' },
        });

        const mailOptions = {
            from: 'sarath91600@gmail.com',
            to: email,
            subject: 'OTP for Aura Perfumes Registration',
            text: `Your OTP is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.render('user/register', { error: 'Failed to send OTP. Please try again.' });
            } else {
                console.log('Email sent:', info.response);
                res.redirect(`/user/otp?redirect=${encodeURIComponent(redirectUrl)}`);
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
                pass: 'vavo cqra matf covp', 
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





// // Verify OTP

const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    let redirectUrl = req.session.redirect || "/user/home"; // Get stored redirect URL

    console.log("Entered OTP:", otp);
    console.log("Stored OTP:", req.session.otp);
    console.log("Redirect URL before fixing:", redirectUrl); // Debugging

    if (otp === req.session.otp?.toString()) {
        console.log("OTP verified successfully!");

        try {
            const userDetails = req.session.userDetails;
            const newUser = new User(userDetails);
            await newUser.save();
            console.log("User saved to database:", newUser);

            // Store user session
            req.session.user = {
                fullName: newUser.fullName,
                email: newUser.email,
            };

            // 🔹 Fix redirect URL extraction
            const urlParams = new URL(redirectUrl, "http://localhost:4000").searchParams;
            redirectUrl = urlParams.get("redirect") || redirectUrl;

            console.log("Final Redirect URL:", redirectUrl);

            // Clear session AFTER using redirect URL
            req.session.otp = null;
            req.session.userDetails = null;
            req.session.redirect = null;

            // Redirect to the extracted correct page
            res.redirect(redirectUrl);
        } catch (error) {
            console.error("Error saving user to database:", error);
            res.render("user/otp", { error: "Failed to save user. Please try again later." });
        }
    } else {
        console.log("Invalid OTP entered.");
        res.render("user/otp", { error: "Invalid OTP. Please try again." });
    }
};



// Step 1: Send OTP for Password Reset
const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("user/forgotPassword", { error: "Email not found." });
        }

        const otp = Math.floor(1000 + Math.random() * 9000);
        req.session.resetOtp = otp;
        req.session.resetEmail = email;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: "sarath91600@gmail.com", pass: "vavo cqra matf covp" },
        });

        const mailOptions = {
            from: "sarath91600@gmail.com",
            to: email,
            subject: "Password Reset OTP - Aura Perfumes",
            text: `Your OTP for password reset is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
                return res.render("user/forgotPassword", { error: "Failed to send OTP. Please try again." });
            } else {
                console.log("Reset OTP sent:", req.session.resetOtp);
                res.redirect("/user/reset-otp");
            }
        });
    } catch (error) {
        console.error("Error sending reset OTP:", error);
        res.render("user/forgotPassword", { error: "Something went wrong. Please try again later." });
    }
};



// Step 2: Verify OTP
const verifyResetOtp = async (req, res) => {
    const { otp } = req.body;

    if (otp === req.session.resetOtp?.toString()) {
        console.log("Reset OTP verified successfully!");
        req.session.resetOtpVerified = true;
        res.redirect("/user/updatePassword");
    } else {
        console.log("Invalid OTP entered.");
        res.render("user/otpVerification", { error: "Invalid OTP. Please try again." });
    }
};

// Step 3: Set New Password
const setNewPassword = async (req, res) => {
    if (!req.session.resetOtpVerified) {
        return res.redirect("/user/forgot-password");
    }

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await User.findOneAndUpdate(
            { email: req.session.resetEmail },
            { password: hashedPassword }
        );

        console.log("Password updated successfully!");

        req.session.resetOtp = null;
        req.session.resetEmail = null;
        req.session.resetOtpVerified = null;

        res.redirect("/user/login");
    } catch (error) {
        console.error("Error updating password:", error);
        res.render("user/newPassword", { error: "Failed to update password. Please try again." });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let redirect = req.body.redirect || req.query.redirect; // Get redirect from form

        if (!email || !password) {
            return res.render("user/login", { message: "All fields are required", redirect });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.render("user/login", { message: "No user found", redirect });
        }

        if (user.status !== "Active") {
            return res.render("user/login", { 
                message: "Sorry, your account is blocked. Please contact admin.aura@gmail.com", 
                redirect 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render("user/login", { message: "Incorrect password", redirect });
        }

        req.session.user = user;

        // Debugging Log
        console.log("Redirecting to:", redirect);

        // Redirect to the original page, defaulting to /user/home
        res.redirect(redirect && redirect !== "undefined" ? redirect : "/user/home");

    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).send("Server Error");
    }
};









  
const loadHome = async (req, res) => {
  console.log('User session in loadHome:', req.session.user); // Debugging step
  res.render('user/home', { user: req.session.user });
};


// Render OTP verification page

const getOtpPage = (req, res) => {
    try {
        const redirectUrl = req.query.redirect || req.session.redirect || "/user/home"; // 🔹 Ensure correct redirect
        console.log("🔹 OTP Page - Received redirect:", redirectUrl);
        res.render("user/otp", { redirect: redirectUrl });
    } catch (error) {
        console.error("Error in getOtpPage:", error);
        res.status(500).send("Internal Server Error");
    }
};
// const getOtpPage = (req, res) => {
//     try {
//         // Ensure redirect is preserved
//         const redirectUrl = req.query.redirect || req.session.redirect || "/user/home";

//         console.log("OTP Page - Received redirect:", redirectUrl);

//         res.render("user/otp", { redirect: redirectUrl });
//     } catch (error) {
//         console.error("Error in getOtpPage:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };



// Render login page
const getLoginPage = (req, res) => {
    res.render("user/login", { redirect: req.query.redirect || "/user/home" });
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

      // Get logoutSuccess query parameter from the request
      const logoutSuccess = req.query.logoutSuccess === 'true';

      // Render the home page with the categories, new products, user data, and logoutSuccess flag
      res.render('user/home', { user, categories, newProducts, logoutSuccess });

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
        res.render('user/product', { category, products ,user: req.session.user });
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
        relatedProducts,user: req.session.user ,
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
    const previousPage = req.get("Referer") || "/user/home"; // Get previous page or fallback to home
    const redirectUrl = new URL(previousPage, `${req.protocol}://${req.get("host")}`); 

    redirectUrl.searchParams.set("loggedOut", "true"); // Add query parameter

    req.session.destroy((err) => {
        if (err) {
            console.error("Error logging out:", err);
            return res.status(500).send("Error logging out.");
        }
        req.session = null; // Ensure session is cleared
        res.redirect(redirectUrl.toString()); // Redirect to previous page with query parameter
    });
};


module.exports = { registerUser, getOtpPage, verifyOtp, loadHome, login, getLoginPage, resendOtp,getCategoriesForUser,logout,getCategoryProducts,getProductDetail,getNewCollections,      sendResetOtp,

    verifyResetOtp,
    setNewPassword, };
    

const express = require('express');
const auth=require("../middleware/auth")
const userController=require("../controllers/userController")
const {
    registerUser,
    getOtpPage,
    verifyOtp,
    loadHome,
    login,
    getLoginPage,
    resendOtp,
    getCategoriesForUser,
    logout  // Import the new function
} = require('../controllers/userController');
const { isLogin } = require('../middleware/auth');
const router = express.Router();

// Home page route (with categories)
router.get('/home', getCategoriesForUser);  // This route will render the home page with categories

//router.get('/home', loadHome)

// Register user routes
router.get('/register', isLogin, (req, res) => {
    res.render('user/register', {message : ''});
});
router.post('/register', registerUser);

// OTP verification routes
router.get('/otp', getOtpPage);
router.post('/otp', verifyOtp);

// Resend OTP route
router.post('/resend-otp', resendOtp);

// Login routes
router.get('/login', isLogin, getLoginPage);
router.post('/login', login);



router.get("/logout", userController.logout);


module.exports = router;

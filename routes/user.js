const express = require('express');
const {
    registerUser,
    getOtpPage,
    verifyOtp,
    loadHome,
    login,
    getLoginPage,
    resendOtp
} = require('../controllers/userController');
const { isLogin } = require('../middleware/auth');
const router = express.Router();

// Home page route
router.get('/', loadHome);

// Register user routes
router.get('/register', isLogin, (req, res) => {
    res.render('user/register');
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

module.exports = router;

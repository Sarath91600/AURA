const express = require('express');
const auth = require("../middleware/auth")
const userController=require("../controllers/userController")

const {
    registerUser,
    getOtpPage,
    verifyOtp,
     login,
    getLoginPage,
    resendOtp,
    getCategoriesForUser,
    
       // Import the new function
} = require('../controllers/userController');
const { isLogin } = require('../middleware/auth');
const router = express.Router();

//Home page route (with categories)
router.get('/home', getCategoriesForUser);  // This route will render the home page with categories






// Register user routes
router.get('/register', isLogin, (req, res) => {
    res.render('user/register', {message : ''});
});
router.post('/register', registerUser);

// OTP verification routes
router.get('/otp',auth.checkSession, getOtpPage);
router.post('/otp', verifyOtp);

// Resend OTP route
router.post('/resend-otp', resendOtp);

// Login routes
router.get('/login', isLogin, getLoginPage);
router.post('/login', login);





// Define route for category products
router.get('/category/:categoryName', userController.getCategoryProducts);

// Route to get product details
router.get('/product/:id', userController.getProductDetail);







router.get('/logout', userController.logout);





module.exports = router;

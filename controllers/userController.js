const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');

// Register a new user
const registerUser = async (req, res) => {
    const { fullName, mobile, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('user/register', { error: 'Email already exists.' });
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
                pass: 'vavo cqra matf covp', // Replace with your app password
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

            // Clear session data
            req.session.otp = null;
            req.session.userDetails = null;

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

// Render home page
const loadHome = (req, res) => {
    res.render('user/home');
};

// Render OTP verification page
const getOtpPage = (req, res) => {
    res.render('user/otp');
};

// Render login page
const getLoginPage = (req, res) => {
    res.render('user/login');
};

module.exports = { registerUser, getOtpPage, verifyOtp, loadHome, login, getLoginPage, resendOtp };

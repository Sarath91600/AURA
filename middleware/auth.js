// middlewear/auth.js

// Middleware to prevent logged-in users from accessing login or register pages
const isLogin = (req, res, next) => {
    if (req.session.user) {
        // If the user is logged in, redirect them to the home page
        return res.redirect("/user/home");
    }
    next(); // Allow the request to proceed to the next middleware if not logged in
};
module.exports = { isLogin };
// middlewear/auth.js

const checkSesssion = (req, res, next) => {
    if (req.session.user) {
        next(); // Allow the user to proceed if they are logged in
    } else {
        // Prevent caching of the page if the user is not logged in
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        res.redirect("login"); // Redirect to login page if the user is not logged in
    }
};

// Middleware to prevent logged-in users from accessing login or register pages
const isLogin = (req, res, next) => {
    if (req.session.user) {
        // If the user is logged in, redirect them to the home page
        return res.redirect("/user/home");
    }
    next(); // Allow the request to proceed to the next middleware if not logged in
};
module.exports = { isLogin,checkSesssion };
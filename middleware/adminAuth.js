// Corrected function names and exported object
const checkSession = (req, res, next) => {
    if (req.session.admin) {
        next(); // Allow the user to proceed if they are logged in
    } else {
        // Prevent caching of the page if the user is not logged in
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        res.redirect("/admin/login"); // Redirect to login page if the user is not logged in
    }
};

const isLogin = (req, res, next) => {
    if (req.session.admin) {
        // Prevent caching of the page if the user is logged in
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        
        return res.redirect("/admin/dashboard"); // Redirect to dashboard if user is already logged in
    } else {
        next(); // Continue to the login page if user is not logged in
    }
};

module.exports = { checkSession, isLogin }; // Correct export

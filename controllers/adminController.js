const adminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const loadLogin = async (req, res) => {
  res.render("admin/login");
};


const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the admin exists in the database
    const admin = await adminModel.findOne({ username });

    if (!admin) {
      const errorMessage = "Invalid Username"; // Define the error message
      console.log("Rendering login page with message:", errorMessage);
      return res.render("admin/login", { message: errorMessage }); // Send the message to the view
    }

    // Log entered password and hashed password from DB for debugging
    console.log("Entered password:", password);
    console.log("Hashed password from DB:", admin.password);

    // Compare the entered password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("Password match:", isMatch);  // Log the result of password comparison

    if (!isMatch) {
      const errorMessage = "Incorrect Password"; // Define the error message
      console.log("Rendering login page with message:", errorMessage);
      return res.render("admin/login", { message: errorMessage }); // Send the message to the view
    }

    // If username and password are correct, create a session and redirect to the dashboard
    req.session.admin = true;
    res.redirect("/admin/dashboard");

  } catch (error) {
    console.error("Error during login:", error);
    const errorMessage = "An error occurred. Please try again."; // Define the error message
    return res.render("admin/login", { message: errorMessage }); // Send the message to the view
  }
};




// Block a user
const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await userModel.findByIdAndUpdate(userId, { status: 'Blocked' }); // Update status to 'Blocked'
    res.redirect("/admin/dashboard"); // Redirect to the dashboard after blocking
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).send("Error blocking user");
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await userModel.findByIdAndUpdate(userId, { status: 'Active' }); // Update status to 'Active'
    res.redirect("/admin/dashboard"); // Redirect to the dashboard after unblocking
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).send("Error unblocking user");
  }
};

// Load the admin dashboard with all users
const loadDashboard = async (req, res) => {
  try {
    const admin = req.session.admin;
    if (!admin) {
      return res.redirect("/admin/login");
    }

    const users = await userModel.find({});
    res.render("admin/dashboard", { users });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.render("admin/dashboard", { message: "An error occurred while loading the dashboard." });
  }
};

const logout = async (req, res) => {
  try{
    req.session.admin=null
    res.redirect("/admin/login")
  }catch(err){
    console.log(err)
  }
}

module.exports = { loadLogin, login, loadDashboard, blockUser, unblockUser, logout };

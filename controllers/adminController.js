const adminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const loadLogin = async (req, res) => {
  res.render("admin/login");
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await adminModel.findOne({ username });

    if (!admin) {
      return res.render("admin/login", { message: "Invalid Username" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.render("admin/login", { message: "Incorrect Password" });
    }

    req.session.admin = true;
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error during login:", error);
    res.render("admin/login", { message: "An error occurred. Please try again." });
  }
};

const loadDashboard = async (req, res) => {
  try {
    const admin = req.session.admin;
    if (!admin) {
      return res.redirect("/admin/login");
    }
    const users = await userModel.find({});
    res.render("admin/dashboard", { users });
  } catch (error) {
    res.render("admin/dashboard", { message: "An error occurred while loading the dashboard." });
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await userModel.findByIdAndUpdate(userId, { status: 'Blocked' });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).send("Error blocking user");
  }
};

const unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await userModel.findByIdAndUpdate(userId, { status: 'Active' });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).send("Error unblocking user");
  }
};

const logout = async (req, res) => {
  try {
    req.session.admin = null;
    res.redirect("/admin/login");
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  loadLogin,
  login,
  loadDashboard,
  blockUser,
  unblockUser,
  logout,
};
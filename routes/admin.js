const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

router.get("/login", adminAuth.isLogin, adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/dashboard", adminAuth.checkSession, adminController.loadDashboard);

router.get("/blockUser/:id", adminAuth.checkSession, adminController.blockUser); // Block user
router.get("/unblockUser/:id", adminAuth.checkSession, adminController.unblockUser); // Unblock user

router.get('/logout',adminController.logout)

module.exports = router;


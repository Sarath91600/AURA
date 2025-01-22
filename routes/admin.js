const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const upload = require('../middleware/upload');

router.get("/login", adminAuth.isLogin, adminController.loadLogin);
router.post("/login", adminAuth.isLogin, adminController.login);
router.get("/dashboard", adminAuth.checkSession, adminController.loadDashboard);

router.get("/blockUser/:id", adminAuth.checkSession, adminController.blockUser); // Block user
router.get("/unblockUser/:id", adminAuth.checkSession, adminController.unblockUser); // Unblock user

router.get('/logout',adminController.logout)

// Route to render the category management page
router.get('/categories', adminAuth.checkSession, adminController.getCategories);

// Route to add a new category (with image upload)
router.post('/categories/add', upload.single('image'), adminController.addCategory);

// Route to edit an existing category (with image upload)
// Route to edit a category

// Route to render the edit category page
router.get('/categories/edit/:id', adminController.getEditCategoryPage);
router.post('/categories/edit/:id', upload.single('image'), adminController.editCategory);

// Route to delete a category (soft delete)
router.post('/categories/delete/:id', adminController.deleteCategory);

module.exports = router;

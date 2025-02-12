const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const adminAuth = require("../middleware/adminAuth");
const Category = require('../models/category');
const { uploadSingle: uploadCategorySingle } = require('../middleware/upload'); // Rename import for category upload
const { uploadProductImage } = require('../middleware/uploadProductImages')

// Admin routes
router.get("/login", adminAuth.isLogin, adminController.loadLogin);
router.post("/login", adminAuth.isLogin, adminController.login);
router.get("/dashboard", adminAuth.checkSession, adminController.loadDashboard);
router.get("/blockUser/:id", adminAuth.checkSession, adminController.blockUser); // Block user
router.get("/unblockUser/:id", adminAuth.checkSession, adminController.unblockUser); // Unblock user
router.get('/logout', adminController.logout);

// Category routes
router.get('/categories', adminAuth.checkSession, categoryController.getCategories); // Fetch categories
router.post('/categories/add', adminAuth.checkSession, uploadCategorySingle, categoryController.addCategory); // Add category
router.get('/categories/edit/:id', adminAuth.checkSession, categoryController.getEditCategoryPage); // Edit category page
router.post('/categories/edit/:id', adminAuth.checkSession, uploadCategorySingle, categoryController.editCategory); // Update category
router.post('/categories/delete/:id', adminAuth.checkSession, categoryController.deleteCategory); // Soft delete



// Route to display all products (Admin view)
router.get('/product', productController.getProducts);

// Route to display add product form
router.get('/addProduct', async (req, res) => {
    try {
        const categories = await Category.find({ deleted: false });
        res.render('admin/addProduct', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

// Route to handle adding a product
router.post('/addProduct', uploadProductImage, productController.addProduct);

// Route to display edit product form
router.get('/editProduct/:id', productController.getEditProduct);

// Route to handle updating product details
//router.post('/editProduct/:id', uploadProductImage, productController.updateProduct);
router.post('/product/edit/:id', uploadProductImage, productController.updateProduct);

// Route to handle soft deleting a product
router.post('/product/delete/:id', productController.deleteProduct);




module.exports = router;



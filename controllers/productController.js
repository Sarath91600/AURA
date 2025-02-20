const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Category = require('../models/category');

/// Fetch products with isDeleted: false
const getProducts = async (req, res) => {
    try {
        let query = { isDeleted: false };
        
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: "i" }; // Case-insensitive search
        }

        const products = await Product.find(query).populate('category');
        const categories = await Category.find({ deleted: false });

        res.render('admin/product', { products, categories, searchQuery: req.query.search || '' });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Server error');
    }
};






const addProduct = async (req, res) => {
    try {
        // Fetch active categories for the product form
        const categories = await Category.find({ deleted: false });

        // Check if images are uploaded
        if (!req.files || !req.files.mainImage || !req.files.firstImage || !req.files.secondImage || !req.files.thirdImage) {
            return res.status(400).send("All image fields are required.");
        }

        // Create the new product object
        const newProduct = {
            mainImage: `/uploads/products/${req.files.mainImage[0].filename}`,
            firstImage: `/uploads/products/${req.files.firstImage[0].filename}`,
            secondImage: `/uploads/products/${req.files.secondImage[0].filename}`,
            thirdImage: `/uploads/products/${req.files.thirdImage[0].filename}`,
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            discount: req.body.discount,
            stock: req.body.stock,
            description: req.body.description,
            highlights: req.body.highlights.split(',')
        };

        // Create the product in the database
        await Product.create(newProduct);

        // Redirect to the product page after successful creation
        res.redirect("/admin/product");

    } catch (err) {
        console.error("Error creating product:", err);

        // If there's an error, render the form again with the categories
        res.render('admin/addProduct', { categories, error: 'Error creating product' });
    }
};


// Get product for editing
const getEditProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).send("Product not found");
        }

        const categories = await Category.find({deleted:false});

        res.render('admin/editProduct', { product, categories });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Internal Server Error");
    }
};



// Update product
const updateProduct = async (req, res) => {
    try {
        const { name, category, price, discount, stock, description, highlights } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.name = name;
        product.category = category;
        product.price = price;
        product.discount = discount;
        product.stock = stock;
        product.description = description;
        product.highlights = highlights.split(',');

        if (req.files) {
            if (req.files.mainImage) product.mainImage = `/uploads/products/${req.files.mainImage[0].filename}`;
            if (req.files.firstImage) product.firstImage = `/uploads/products/${req.files.firstImage[0].filename}`;
            if (req.files.secondImage) product.secondImage = `/uploads/products/${req.files.secondImage[0].filename}`;
            if (req.files.thirdImage) product.thirdImage = `/uploads/products/${req.files.thirdImage[0].filename}`;
        }

        await product.save();
        res.redirect('/admin/product');
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
};

// Soft delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.redirect('/admin/product');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product' });
    }
};

module.exports = {
    addProduct,
    getEditProduct,
    updateProduct,
    deleteProduct,
    getProducts
};

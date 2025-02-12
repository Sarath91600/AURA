const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Referencing the Category model
        required: true
    },
    mainImage: { // Main image for the product
        type: String,
        required: true
    },
    firstImage: { // First additional image
        type: String,
        required: true
    },
    secondImage: { // Second additional image
        type: String,
        required: true
    },
    thirdImage: { // Third additional image
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: Number, // Discount as percentage
        default: 0
    },
    highlights: [{ // List of product highlights
        type: String,
        required: true
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Avoid overwriting the model by checking if it exists first
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// Automatically adding the product to the category after it's saved
productSchema.post('save', async function (doc) {
    const Category = mongoose.model('Category');
    try {
        await Category.findByIdAndUpdate(doc.category, {
            $addToSet: { products: doc._id }
        });
    } catch (error) {
        console.error("Error associating product with category:", error.message);
    }
});

module.exports = Product;

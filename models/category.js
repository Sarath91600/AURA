const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  deleted: { type: Boolean, default: false }, // Soft delete flag
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Product model
    },
  ],
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

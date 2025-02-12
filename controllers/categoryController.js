const Category = require('../models/category');


//add category
const addCategory = async (req, res) => {
  try {
    let { name } = req.body;
    const image = req.file ? req.file.filename : '';

    // Trim spaces and replace multiple spaces with a single space
    name = name.trim().replace(/\s+/g, ' ');

    // Check if the category already exists (case-insensitive)
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (existingCategory) {
      return res.status(400).json({ message: 'This category already exists!' });
    }

    // Create and save the new category
    const newCategory = new Category({ name, image });
    await newCategory.save();

    res.status(200).json({ message: 'Category added successfully!' });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





// Edit Category Page
const getEditCategoryPage = async (req, res) => {
  try {
    const { id } = req.params; // Extract category ID
    const category = await Category.findById(id); // Find category by ID

    if (category) {
      res.render('admin/editCategory', { category }); // Render edit page
    } else {
      res.status(404).send('Category not found');
    }
  } catch (error) {
    console.error('Error fetching category for editing:', error);
    res.status(500).send('Server error');
  }
};

const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { name } = req.body;

    // Remove extra spaces and capitalize the name
    name = name.replace(/\s+/g, ' ').trim().toUpperCase();

    // Check if another category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Only check for duplicate if the name is actually changed
    if (category.name !== name) {
      if (existingCategory && existingCategory._id.toString() !== id) {
        return res.status(400).json({ message: 'Category name already exists.' });
      }
    }

    // Update category details
    category.name = name;

    if (req.file) {
      category.image = req.file.filename; // Update image if new one uploaded
    }

    await category.save(); // Save the updated category

    return res.status(200).json({ message: 'Category updated successfully.' });
  } catch (error) {
    console.error('Error editing category:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};




// Get All Categories (Admin View)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ deleted: false }); // Fetch active categories
    res.render('admin/categories', { categories }); // Render categories page
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Server error');
  }
};

// Soft Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (category) {
      category.deleted = true; // Soft delete
      await category.save();
      res.redirect('/admin/categories');
    } else {
      res.status(404).send('Category not found');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  addCategory,
  editCategory,
  getEditCategoryPage,
  deleteCategory,
  getCategories,
  
};

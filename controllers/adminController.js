const adminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const Category = require('../models/category');
const upload = require('../middleware/upload');  // Import the multer upload middleware

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
    // Check if the user is logged in (i.e., session exists)
    const admin = req.session.admin;
    
    if (!admin) {
      // If not logged in, redirect to login page
      return res.redirect("/admin/login");
    }

    // Fetch the users data to display on the dashboard
    const users = await userModel.find({});
    res.render("admin/dashboard", { users });
    
  } catch (error) {
    
    res.render("admin/dashboard", { message: "An error occurred while loading the dashboard." });
  }
};

const logout = async (req, res) => {
  try{
    req.session.admin=null
    console.log(req.session.admin)
    if(req.session.admin == null){
      res.redirect("/admin/login")
    }
    else{
      res.redirect("/admin/dashboard")
    }
  }catch(err){
    console.log(err)
  }
}



// Add category
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file.path;  // Assuming you use multer for file upload

    const newCategory = new Category({ name, image });
    await newCategory.save();

    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};



// Add Category function
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;  // Extract the category name from the request body
    const image = req.file ? req.file.filename : '';  // Get the uploaded file's name

    // Create a new category document
    const newCategory = new Category({
      name,
      image,
    });

    // Save the new category
    await newCategory.save();

    // Redirect back to the category management page with a success message
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send('Server error');
  }
};

// Soft delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndUpdate(id, { deleted: true });
    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// GET method to render the Edit Category page
const getEditCategoryPage = async (req, res) => {
  try {
    const { id } = req.params; // Get the category ID from the URL
     console.log(req.params);
     
    // Find the category by its ID
    const category = await Category.findById(id);

    if (category) {
      console.log(category);
      
      res.render('admin/editCategory', { category }); // Render the edit category page
    } else {
      res.status(404).send('Category not found'); // Error if not found
    }
  } catch (error) {
    console.error('Error fetching category for editing:', error);
    res.status(500).send('Server error');
  }
};

// Function to Edit a Category
const editCategory = async (req, res) => {
  try {
    const { id } = req.params; // Get category ID from the URL
    const { name } = req.body; // Updated name from form

    // Find the category by ID
    const category = await Category.findById(id);

    if (category) {
      // Update the name
      category.name = name;

      // If a new image is uploaded, update it
      if (req.file) {
        category.image = req.file.filename;
      }

      // Save changes
      await category.save();
      res.redirect('/admin/categories'); // Redirect to categories page
    } else {
      res.status(404).send('Category not found'); // Error if not found
    }
  } catch (error) {
    console.error('Error editing category:', error);
    res.status(500).send('Server error');
  }
};

// Fetch all categories (for home page)
exports.getCategories = async (req, res) => {
  try {
    // Fetch only categories that are not marked as deleted
    const categories = await Category.find({ deleted: false });

    // Render the home page with categories
    res.render('home', { categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};



// Delete (soft delete) Category function
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;  // Get category ID from the URL parameter

    const category = await Category.findById(id);  // Find the category by ID
    if (category) {
      category.deleted = true;  // Set the deleted flag to true (soft delete)
      await category.save();  // Save the updated category
      res.redirect('/admin/categories');  // Redirect to category management page after deletion
    } else {
      res.status(404).send('Category not found');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Server error');
  }
};

// Fetch Categories for the Admin (for home page or category listing)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ deleted: false });  // Fetch non-deleted categories

    res.render('admin/categories', { categories });  // Render the category page with the categories
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Server error');
  }
};






module.exports = {
  loadLogin,
  login,
  loadDashboard,
  blockUser,
  unblockUser,
  logout,
  addCategory,
  editCategory,
  getEditCategoryPage,
  deleteCategory,
  getCategories,
};


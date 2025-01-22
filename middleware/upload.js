const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');  // Save images in the 'uploads' folder under public directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Create a unique filename
  },
});

// Create multer upload instance
const upload = multer({ storage });

module.exports = upload;

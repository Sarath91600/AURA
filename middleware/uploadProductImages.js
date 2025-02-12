const multer = require("multer");
const path = require("path");
const fs = require("fs");  // Required to handle file writing in the file system

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/products"); // Path for saving uploaded images
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + path.extname(file.originalname) // Save with unique filename
    );
  },
});

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Only images (JPEG, JPG, PNG) are allowed.");
  }
};

// Max file size for images (5MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware to handle the image uploads for product creation
const uploadProductImage = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "firstImage", maxCount: 1 },
  { name: "secondImage", maxCount: 1 },
  { name: "thirdImage", maxCount: 1 },
]);

module.exports = { uploadProductImage };

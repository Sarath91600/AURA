const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Define the upload directory
const uploadPath = path.join(__dirname, "../public/uploads");

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the upload directory exists
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`; // Unique filename
        cb(null, uniqueName);
    }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPG, PNG, and JPEG are allowed."), false);
    }
};

// Multer configuration for single image upload
const uploadSingle = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
}).single("image"); // Accept a single file with the name 'image'

// Export the upload middleware
module.exports = { uploadSingle };

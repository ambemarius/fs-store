// backend/middleware/imageUpload.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with our private keys
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up storage rules
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'shoe_smart_catalog', // Name of the folder inside Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Safe image formats
        transformation: [{ width: 600, height: 600, crop: 'limit', quality: 'auto' }] // Automatically shrinks & optimizes images to save customer data!
    }
});

// Initialize multer middleware
const upload = multer({ storage: storage });

module.exports = upload;
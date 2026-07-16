// backend/controllers/productController.js
const Product = require('../models/product');

// @desc    Get all products (with optional filtering)
// @route   GET /api/products
// @access  Public (Anyone browsing the catalog can see this)
const getProducts = async (req, res) => {
    try {
        const { category, size } = req.query;
        let query = {};

        // If the user clicks a category filter (e.g., Sneakers)
        if (category) {
            query.category = category;
        }

        // If the user filters by shoe size
        if (size) {
            query.sizes = { $in: [Number(size)] }; // Finds if the size exists in our sizes array
        }

        // Only show items that are active/available to customers
        query.isAvailable = true;

        const products = await Product.find(query).sort({ createdAt: -1 }); // Newest arrivals first
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Shoe not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new shoe listing
// @route   POST /api/products
// @access  Private (Eventually protected for admin only)
const createProduct = async (req, res) => {
    try {
        const { name, price, category, sizes } = req.body;

        // Extract the Cloudinary URLs from the files uploaded by the middleware
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one shoe image' });
        }
        const imageUrls = req.files.map(file => file.path); 

        // Convert sizes from a string comma-separated list (from form-data) into an array of numbers
        // e.g., "42,43" becomes [42, 43]
        const parsedSizes = typeof sizes === 'string' 
            ? sizes.split(',').map(Number) 
            : sizes;

        if (!name || !price || !category || !parsedSizes) {
            return res.status(400).json({ message: 'Please provide all required text fields' });
        }

        const newProduct = await Product.create({
            name,
            price: Number(price),
            category,
            sizes: parsedSizes,
            imageUrls
        });

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Toggle "Sold Out" status without deleting the shoe
// @route   PATCH /api/products/:id/toggle
// @access  Private (Admin only)
const toggleAvailability = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Shoe not found' });
        }

        // Flip the true/false switch
        product.isAvailable = !product.isAvailable;
        await product.save();

        res.status(200).json({ 
            message: `Product availability updated to ${product.isAvailable}`, 
            product 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const folderIndex = parts.indexOf('shoe_smart_catalog');
    if (folderIndex !== -1 && folderIndex < parts.length - 1) {
        const pathWithExtension = parts.slice(folderIndex).join('/');
        const dotIndex = pathWithExtension.lastIndexOf('.');
        return dotIndex !== -1 ? pathWithExtension.substring(0, dotIndex) : pathWithExtension;
    }
    const filenameWithExtension = parts[parts.length - 1];
    const dotIndex = filenameWithExtension.lastIndexOf('.');
    return dotIndex !== -1 ? filenameWithExtension.substring(0, dotIndex) : filenameWithExtension;
};

// @desc    Delete a shoe listing and its Cloudinary images
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Shoe not found' });
        }

        // Delete images from Cloudinary
        if (product.imageUrls && product.imageUrls.length > 0) {
            for (const url of product.imageUrls) {
                const publicId = getPublicIdFromUrl(url);
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
                } catch (cloudinaryError) {
                    console.error(`Failed to delete Cloudinary image: ${publicId}`, cloudinaryError.message);
                }
            }
        }

        // Delete from database
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Shoe listing and associated images deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    toggleAvailability,
    deleteProduct
};
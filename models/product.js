// backend/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a shoe name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price in XAF']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Sneakers', 'Formal', 'Boots', 'Ladies Wear', 'Sandals'] // Restricts inputs to these exact types
    },
    sizes: {
        type: [Number], // Array of numbers e.g., [41, 42, 43]
        required: [true, 'Please add at least one available size']
    },
    imageUrls: {
        type: [String], // Array of strings holding image URLs from Cloudinary
        required: [true, 'Please upload at least one image']
    },
    isAvailable: {
        type: Boolean,
        default: true // Easily toggle "Sold Out" status without deleting the product
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
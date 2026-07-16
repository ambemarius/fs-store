// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById,
    createProduct, 
    toggleAvailability,
    deleteProduct
} = require('../controllers/productController');
const upload = require('../middleware/imageUpload'); //  Import our new engine

// Middleware to ensure user is logged in as an admin
const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

// Map URLs to the controller functions
router.get('/', getProducts);          // URL: GET http://localhost:5000/api/products
router.get('/:id', getProductById);    // URL: GET http://localhost:5000/api/products/:id

// Protected Admin Routes
router.post('/', ensureAdmin, upload.array('images', 4), createProduct);       // URL: POST http://localhost:5000/api/products
router.patch('/:id/toggle', ensureAdmin, toggleAvailability); // URL: PATCH http://localhost:5000/api/products/[ID]/toggle
router.delete('/:id', ensureAdmin, deleteProduct);           // URL: DELETE http://localhost:5000/api/products/[ID]

module.exports = router;
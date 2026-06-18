// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById,
    createProduct, 
    toggleAvailability 
} = require('../controllers/productController');
const upload = require('../middleware/imageUpload'); //  Import our new engine
// Map URLs to the controller functions
router.get('/', getProducts);          // URL: GET http://localhost:5000/api/products
router.get('/:id', getProductById);    // URL: GET http://localhost:5000/api/products/:id
router.post('/', upload.array('images', 4), createProduct);       // URL: POST http://localhost:5000/api/products
router.patch('/:id/toggle', toggleAvailability); // URL: PATCH http://localhost:5000/api/products/[ID]/toggle

module.exports = router;
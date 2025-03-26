const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

const router = express.Router();

// Public Routes (Customers can access these)
router.get('/', productController.getAllProducts); // Get all products
router.get('/:id', productController.getProductById); // Get product by ID

// Admin Routes (Protected)
router.post(
    '/', 
    authMiddleware.protect, 
    authMiddleware.authorizeAdmin, 
    upload.array('images', 10),  // ✅ Allow multiple images
    productController.addProduct
);

router.put(
    '/:id', 
    authMiddleware.protect, 
    authMiddleware.authorizeAdmin, 
    upload.array('images', 10),  // ✅ Allow multiple image updates
    productController.updateProduct
);

router.delete(
    '/:id', 
    authMiddleware.protect, 
    authMiddleware.authorizeAdmin, 
    productController.deleteProduct
);

module.exports = router;

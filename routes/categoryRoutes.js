const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
 
router.get('/', categoryController.getAllCategories);
 
router.post('/', authMiddleware.protect, authMiddleware.authorizeAdmin, categoryController.createCategory);
router.put('/:id', authMiddleware.protect, authMiddleware.authorizeAdmin, categoryController.updateCategory);
router.delete('/:id', authMiddleware.protect, authMiddleware.authorizeAdmin, categoryController.deleteCategory);

module.exports = router;

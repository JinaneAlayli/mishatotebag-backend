const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

router.post('/add', protect, addToCart);
router.get('/', protect, getCart);
router.delete('/:product_id', protect, removeFromCart);

module.exports = router;

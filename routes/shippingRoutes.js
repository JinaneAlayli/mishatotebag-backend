const express = require('express');
const { getDeliveryFee, updateDeliveryFee } = require('../controllers/shippingController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getDeliveryFee);  
router.put('/', protect, authorizeAdmin, updateDeliveryFee);  

module.exports = router;

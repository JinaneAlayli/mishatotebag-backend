const express = require('express');
const { protect,authorizeAdmin } = require('../middleware/authMiddleware');
const {
    checkout,
    getAllOrders,
    getOrderItems,
    cancelOrder,
    deleteOrder,
    updateOrderItem,
    deleteOrderItem,
    updateOrder,
    getUserOrders,
    getBestSellingProducts,getOrderItemsByUser
} = require('../controllers/orderController');

const router = express.Router();

router.post('/checkout', protect, checkout);
router.get('/', protect, getAllOrders);
router.get('/:order_id/items', protect, getOrderItems);
router.delete('/:order_id/cancel', protect,authorizeAdmin, cancelOrder);
router.delete('/:order_id/delete', protect,authorizeAdmin, deleteOrder);
router.put('/item/:order_item_id', protect,authorizeAdmin, updateOrderItem);
router.delete('/:order_id/item/:order_item_id', protect,authorizeAdmin, deleteOrderItem);
router.put('/:order_id', protect, authorizeAdmin,updateOrder);
router.get('/my-orders', protect, getUserOrders);
router.get("/best-sellers", protect, authorizeAdmin, getBestSellingProducts);
router.get("/my-orderItems", protect, getOrderItemsByUser);


module.exports = router;

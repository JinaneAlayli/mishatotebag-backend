const { Op } = require("sequelize");
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');

//  Checkout
exports.checkout = async (req, res) => {
    try {
        const user_id = req.user.id;
        const cartItems = await Cart.findAll({ where: { user_id } });
        const { address } = req.body;

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        if (address) {
            await User.update({ address }, { where: { id: user_id } });
        }

        let product_total = 0;
        for (const item of cartItems) {
            const product = await Product.findByPk(item.product_id);
            if (!product) return res.status(404).json({ error: `Product ID ${item.product_id} not found` });
            product_total += product.price * item.quantity;
        }

        const shipping = await require('../models/Shipping').findOne();
        const delivery_fee = shipping ? shipping.delivery_fee : 0;

        const total = product_total + delivery_fee;

        const order = await Order.create({ user_id, total_price: total, status: 'pending' });

        for (const item of cartItems) {
            await OrderItem.create({ order_id: order.id, product_id: item.product_id, quantity: item.quantity });
            await Product.increment('stock', { by: item.quantity, where: { id: item.product_id } });
        }

        await Cart.destroy({ where: { user_id } });

        res.status(201).json({
            message: 'Order placed successfully',
            order_id: order.id,
            total,
            delivery_fee
        });
    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};


// Orders 
exports.getAllOrders = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
        const orders = await Order.findAll();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({ where: { user_id: req.user.id } });
        if (orders.length === 0) return res.status(404).json({ error: 'No orders found' });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get User Orders Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.getOrderItems = async (req, res) => {
    try {
        const { order_id } = req.params;
        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (req.user.id !== order.user_id && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        const items = await OrderItem.findAll({ where: { order_id } });
        res.status(200).json(items);
    } catch (error) {
        console.error('Get Order Items Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

        const { order_id } = req.params;
        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (!['pending', 'canceled'].includes(order.status)) {
            return res.status(400).json({ error: 'Only pending or canceled orders can be deleted' });
        }

        await OrderItem.destroy({ where: { order_id } });
        await order.destroy();

        res.status(200).json({ message: 'Order and related items deleted' });
    } catch (error) {
        console.error('Delete Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

        const { order_id } = req.params;
        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        await order.update({ status: 'canceled' });
        res.status(200).json({ message: 'Order canceled' });
    } catch (error) {
        console.error('Cancel Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
        const { order_id } = req.params;
        const order = await Order.findByPk(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        await order.update(req.body);
        res.status(200).json({ message: 'Order updated' });
    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};

//  Order Items
exports.updateOrderItem = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
        const { order_item_id } = req.params;
        const { quantity } = req.body;
        const item = await OrderItem.findByPk(order_item_id);
        if (!item) return res.status(404).json({ error: 'Order item not found' });
        await item.update({ quantity });
        res.status(200).json({ message: 'Order item updated' });
    } catch (error) {
        console.error('Update Order Item Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOrderItem = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
        const { order_id, order_item_id } = req.params;
        const item = await OrderItem.findOne({ where: { id: order_item_id, order_id } });
        if (!item) return res.status(404).json({ error: 'Order item not found' });

        await item.destroy();
        const remaining = await OrderItem.count({ where: { order_id } });
        if (remaining === 0) {
            await Order.destroy({ where: { id: order_id } });
            return res.status(200).json({ message: 'Order and item deleted' });
        }
        res.status(200).json({ message: 'Order item deleted' });
    } catch (error) {
        console.error('Delete Order Item Error:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.getOrderItemsByUser = async (req, res) => {
    try {
        const { month = 'all' } = req.query;
        const user_id = req.user.id;
        const whereClause = { user_id };

        if (month !== 'all') {
            const monthNumber = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;
            if (isNaN(monthNumber)) return res.status(400).json({ error: 'Invalid month format.' });
            const start = new Date(new Date().getFullYear(), monthNumber - 1, 1);
            const end = new Date(new Date().getFullYear(), monthNumber, 0, 23, 59, 59);
            whereClause.createdAt = { [Op.between]: [start, end] };
        }

        const items = await OrderItem.findAll({
            include: [
                { model: Order, where: whereClause, attributes: ['id', 'status', 'total_price', 'createdAt'] },
                { model: Product, attributes: ['id', 'name', 'price'] }
            ]
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Get Order Items by User Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
/////////////////////////////////////////////

// analytics
exports.getBestSellingProducts = async (req, res) => {
    try {
        const { year = "all", month = "all" } = req.query;
        const whereClause = { status: 'delivered' };

        if (year !== "all") {
            whereClause.createdAt = {
                [Op.gte]: new Date(`${year}-01-01`),
                [Op.lte]: new Date(`${year}-12-31`),
            };
        }

        if (month !== "all" && year !== "all") {
            const monthNumber = new Date(Date.parse(`${month} 1, ${year}`)).getMonth() + 1;
            if (isNaN(monthNumber)) return res.status(400).json({ error: "Invalid month format" });
            whereClause.createdAt = {
                [Op.gte]: new Date(`${year}-${monthNumber}-01`),
                [Op.lte]: new Date(`${year}-${monthNumber}-31`),
            };
        }

        const items = await OrderItem.findAll({
            include: [
                { model: Order, where: whereClause, attributes: [] },
                { model: Product, attributes: ["id", "name", "stock"] }
            ]
        });

        const sales = {};
        for (const item of items) {
            if (!item.Product) continue;
            const { id, name, stock } = item.Product;
            if (!sales[item.product_id]) {
                sales[item.product_id] = { product_name: name, totalSales: 0, stock };
            }
            sales[item.product_id].totalSales += item.quantity;
        }

        const sorted = Object.values(sales).sort((a, b) => b.totalSales - a.totalSales);
        res.status(200).json(sorted.slice(0, 3));
    } catch (error) {
        console.error("Get Best-Selling Products Error:", error);
        res.status(500).json({ error: error.message });
    }
};



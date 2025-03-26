const Shipping = require('../models/Shipping');
 
exports.getDeliveryFee = async (req, res) => {
    try {
        const shipping = await Shipping.findOne(); // Get first record
        if (!shipping) return res.status(404).json({ error: 'No shipping fee set' });

        res.json({ delivery_fee: shipping.delivery_fee });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
 
exports.updateDeliveryFee = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied! Admins only.' });
        }

        const { delivery_fee } = req.body;
        if (!delivery_fee) return res.status(400).json({ error: 'Delivery fee is required' });

        let shipping = await Shipping.findOne();
        if (!shipping) {
            shipping = await Shipping.create({ delivery_fee });
        } else {
            await shipping.update({ delivery_fee });
        }

        res.json({ message: 'Delivery fee updated successfully', delivery_fee });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

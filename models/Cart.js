const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { timestamps: false });

Cart.sync({ alter: true })
    .then(() => console.log('Cart table is synced'))
    .catch(error => console.error('Cart table sync error:', error));

module.exports = Cart;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 


const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }, 
    total_price: { type: DataTypes.FLOAT, allowNull: false }
}, { timestamps: true });

module.exports = Order;

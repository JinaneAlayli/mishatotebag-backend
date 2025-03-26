const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const Product = require("./Product"); 
const Order = require("./Order");

const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: false });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" }); 
module.exports = OrderItem;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./Category'); // Import Category model
//const Cart = require('./Cart');

const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false },
    category_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: Category, key: 'id' } //  Foreign Key
    },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    image: { type: DataTypes.JSON, allowNull: true }
}, { timestamps: true });

//  Set up Product-Category relationship
Category.hasMany(Product, { foreignKey: 'category_id', onDelete: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

//product-cart relationship
//Product.hasMany(Cart, { foreignKey: 'product_id', onDelete: 'CASCADE' });

module.exports = Product;

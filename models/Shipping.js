const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  

const Shipping = sequelize.define('Shipping', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    delivery_fee: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    tableName: 'shipping',  
    timestamps: false 
});
 
Shipping.sync({ alter: true })
    .then(() => console.log('Shipping table is ready'))
    .catch(err => console.error('Error syncing Shipping table:', err));

module.exports = Shipping;

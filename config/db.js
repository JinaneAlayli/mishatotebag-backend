const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    dialectModule: require('mysql2'),
    logging: false
});
 
sequelize.sync({ force: false })
    .then(() => console.log('Tables are checked & created if missing'))
    .catch(err => console.error('Sequelize Sync Error:', err));

module.exports = sequelize;

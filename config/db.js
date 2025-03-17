const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',  // Default to mysql
    dialectModule: require('mysql2'),
    logging: console.log
});
 
sequelize.sync({ force: false })
    .then(() => console.log('Tables are checked'))
    .catch(err => console.error('Sequelize Sync Error:', err));

module.exports = sequelize;

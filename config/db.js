// Import Sequelize (an ORM for Node.js to interact with databases)
const { Sequelize } = require('sequelize');

// Load environment variables from .env file
require('dotenv').config();

// Create a new Sequelize instance with database credentials from environment variables

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',  // Default to mysql
    dialectModule: require('mysql2'),
    logging: console.log
});
 
// Synchronize the database schema without forcing a drop (force: false means it won't delete existing tables)

sequelize.sync({ force: false })
    .then(() => console.log('Tables are checked'))
    .catch(err => console.error('Sequelize Sync Error:', err));

    // Export the sequelize instance for use in other parts of the project

module.exports = sequelize;
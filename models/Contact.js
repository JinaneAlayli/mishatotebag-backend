const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Contact = sequelize.define("Contact", {
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  subject: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Contact;

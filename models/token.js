const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Token = sequelize.define("token", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reset: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Token;

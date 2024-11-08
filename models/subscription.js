const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Subscription = sequelize.define("subscription", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Subscription;

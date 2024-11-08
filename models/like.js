const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Like = sequelize.define("like", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Like;

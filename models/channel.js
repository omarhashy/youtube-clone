const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Channel = sequelize.define("channel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  handel: {
    type: DataTypes.STRING(15),
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  channelPictureFile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Channel;

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Video = sequelize.define("video", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  thumbnailFile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  videoFile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  likesCounter: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  commentsCounter: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Video;

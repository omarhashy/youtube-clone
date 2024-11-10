const sequelize = require("../config/database");
const channel = require("./channel");
const comment = require("./comment");
const like = require("./like");
const subscription = require("./subscription");
const token = require("./token");
const video = require("./video");

channel.hasMany(video, {
  foreignKey: {
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});

comment.belongsTo(video, {
  foreignKey: {
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});

comment.belongsTo(channel, {
  foreignKey: {
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});

like.belongsTo(video, {
  foreignKey: {
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});

like.belongsTo(channel, {
  foreignKey: {
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});
subscription.belongsTo(channel, {
  foreignKey: {
    name: "subscriber",
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});

subscription.belongsTo(channel, {
  foreignKey: {
    name: "subscribed",
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "RESTRICT",
});

channel.hasOne(token);

sequelize
  .sync({ force: true })
  // .sync()
  .catch((err) => {
    console.error(err);
  });

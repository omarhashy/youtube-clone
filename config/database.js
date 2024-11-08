const HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(DB_NAME, USERNAME, PASSWORD, {
  host: HOST,
  dialect: "postgres",
  logging: (msg) => {
    if (msg.includes("Executing") && msg.includes("ERROR")) {
      console.error(msg); // Log only errors
    }
  },
});

module.exports = sequelize;

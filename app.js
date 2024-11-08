const PORT = process.env.PORT;

const express = require("express");
const path = require("path");
const sequelize = require("./config/database");
require("./models/association");

//controllers
const errorController = require("./controllers/webApp/errorController");
//routes
const feedRoutes = require("./routes/webApp/feedRoutes");
const authRoutes = require("./routes/webApp/authRoutes");
const { error } = require("console");

//middlewares
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

//static files
app.use("/public", express.static(path.join(__dirname, "public")));

//youtube webApp routes
app.use("/auth", authRoutes);
app.use(feedRoutes);
//404 error
app.use(errorController.get404);
//500 error
app.use(errorController.get500);

sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Connection to the database has been established successfully."
    );
    app.listen(PORT, () => {
      console.log("Connected to server");
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

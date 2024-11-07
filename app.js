const PORT = process.env.PORT;

const express = require("express");
const path = require("path");

//controllers
const errorController = require("./controllers/webApp/errorController");
//routes
const feedRoutes = require("./routes/webApp/feedRoutes");
const authRoutes = require("./routes/webApp/authRoutes");

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

app.listen(PORT, () => {
  console.log("Connected to server");
});

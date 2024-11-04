const PORT = process.env.PORT;

const express = require("express");
const path = require("path");

//controllers
const errorController = require("./controllers/webApp/errorController");

//routes
const youtubeRoutes = require("./routes/webApp/youtubeRoutes");

//middlewares
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

//static files
app.use("/public", express.static(path.join(__dirname, "public")));

//youtube routes
app.use(youtubeRoutes);
//404 error
app.use(errorController.get404);
//500 error
app.use(errorController.get500);

app.listen(PORT, () => {
  console.log("Connected to server");
});

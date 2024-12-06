const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;

const express = require("express");
const flash = require("connect-flash");
const csrf = require("tiny-csrf");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const sequelize = require("./models/association");
const locals = require("./middlewares/locals");
const multer = require("./middlewares/multer");
const authenticationMiddlewares = require("./middlewares/authentication");

//controllers
const errorController = require("./controllers/webApp/errorController");
const apiErrorController = require("./controllers/API/errorController");

//routes
const authRoutesApi = require("./routes/API/authRoutesApi");
const authRoutes = require("./routes/webApp/authRoutes");
const feedRoutes = require("./routes/webApp/feedRoutes");
const creatorRoutes = require("./routes/webApp/creatorRoutes");

const app = express();

//middlewares
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: false }));
app.use("/api/auth", multer.single);
app.use("/auth", multer.single);
app.use("/creator", multer.video);

//static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/files", express.static(path.join(__dirname, "uploads")));

//sessions configuration
const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(
  session({
    secret: SECRET_KEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 45 * 60 * 60 * 1000,
    },
  })
);

sessionStore.sync();

app.use(authenticationMiddlewares.authenticate);

//API
app.use("/api", express.json());
app.use("/api/auth", authRoutesApi);
app.use("/api", apiErrorController.get404);
app.use("/api", apiErrorController.getError);

//webApp
app.use(cookieParser(SECRET_KEY));
app.use(csrf(SECRET_KEY));
app.use(locals.csrfTokenLocals);
app.use(flash());
app.use(locals.flashLocals);
app.use(locals.authLocals);
app.use("/auth", authRoutes);
app.use("/creator", creatorRoutes);
app.use("/creator", creatorRoutes);
app.use(feedRoutes);

//404 error
app.use(errorController.get404);
//500 error
app.use(errorController.get500);

(async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
    // await sequelize.sync({ force: true });
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log("Connected to server");
    });
  } catch (error) {
    console.error(error);
  }
})();

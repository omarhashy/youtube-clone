require("./models/association");

const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;

const express = require("express");
const flash = require("connect-flash");
const csrf = require("tiny-csrf");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const sequelize = require("./config/database");
const locals = require("./middlewares/locals");
const multerSingle = require("./middlewares/multerSingle");

//controllers
const errorController = require("./controllers/webApp/errorController");
const apiErrorController = require("./controllers/API/errorController");

//routes
const feedRoutes = require("./routes/webApp/feedRoutes");
const authRoutesApi = require("./routes/API/authRoutesApi");
const authRoutes = require("./routes/webApp/authRoutes");

const app = express();

//middlewares
app.set("view engine", "ejs");
app.set("views", "views");
app.use(multerSingle);
//static files
app.use("/public", express.static(path.join(__dirname, "public")));
//API
app.use("/api", express.json());
app.use("/api/auth", authRoutesApi);
app.use("/api", apiErrorController.get404);
app.use("/api", apiErrorController.getError);

app.use(express.urlencoded({ extended: true }));
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

//youtube webApp routes
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser(SECRET_KEY));
app.use(csrf(SECRET_KEY));

app.use(flash());
app.use(locals);
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

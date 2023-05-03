const express = require("express");
const layouts = require("express-ejs-layouts");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
require("dotenv").config();
const methodOverride = require("method-override")
const port = process.env.port;
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");

const db = process.env.MongoUri;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log(err));

app.use(layouts);
app.use(methodOverride("_method"))
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: false,
  })
);

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());


app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  next();
});

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "./layouts/main");

app.use("/", require("./routes/index"));
app.use("/authors", require("./routes/authors"));
app.use("/books", require("./routes/books"));

app.listen(port, () => {
  console.log(`running on port ${port}`);
});

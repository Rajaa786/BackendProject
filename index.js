const express = require("express");
const dotenv = require("dotenv");
const connectdb = require("./static/db");
const path = require("path");
const User = require("./static/userSchema");
const session = require("express-session");
const app = express();
dotenv.config();
const bodyParser = require("body-parser");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/static")));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
connectdb();

app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/profile");
  } else if (req.session.userCreated) {
    req.session.userCreated = false;
    res.render("index", { msg: "User created successfully!" });
  } else {
    res.render("index");
  }
});

app.get("/here", (req, res) => {
  res.send("Worked");
});

app.post("/", (req, res) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let newUser = new User({
    username: username,
    email: email,
    password: password,
  });
  let checkUserExists = async () => {
    const user = await User.findOne({
      email: email,
      password: password,
    }).lean();
    if (user) {
      res.send(
        `<h3 style="color : red; font-family: Arial, Helvetica, sans-serif;">*User With Same Email Already Exists</h1>`
      );
    } else {
      let tmp = async () => {
        try {
          await newUser.save().then((savedUser) => {
            req.session.userCreated = true;
            res.redirect("/");
          });
        } catch (error) {
          res.send(`Error : ${error}`);
        }
      };
      tmp();
    }
  };
  checkUserExists();
});

app.post("/authenticate", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let checkUserExists = async () => {
    const user = await User.findOne({
      email: email,
      password: password,
    }).lean();
    if (user) {
      let userData = {
        username_: user.username,
        email_: user.email,
      };
      req.session.user = userData;

      res.redirect("/profile");
    } else {
      res.send(
        `<h2 style="text-align: center; font-family: Arial, Helvetica, sans-serif; color : red" >User Does Not Exist!</h2>`
      );
    }
  };
  checkUserExists();
});

app.get("/profile", (req, res) => {
  if (req.session.user) {
    // console.log(req.session.user);
    res.render("userpage", { userCredentials: req.session.user });
  } else {
    res.send(
      `<h2 style="text-align: center; font-family: Arial, Helvetica, sans-serif;" >Sorry , You are not authorized to view this page :(</h2>`
    );
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});

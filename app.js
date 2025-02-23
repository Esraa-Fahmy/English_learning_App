const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const asyncHandler = require("express-async-handler");
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
//const rateLimit = require('express-rate-limit');


dotenv.config({ path: "config.env" });
const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./midlewares/errmiddleware");
const User = require("./models/userModel");
const createToken = require("./utils/createToken");

dbConnection();

const app = express();


app.use(cors('*'))
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, "uploads")));

// 1️⃣ تحديد عدد الطلبات (Rate Limiting)
/*const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later"
});*/



//secure
//app.use(limiter);
app.use(mongoSanitize());
app.use(hpp());




app.use(
  session({
    secret: "secret",
    "resave": false,
    saveUninitialized: true,
  })
);


app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"
  },(accessToken, refreshToken, profile, done) => {
    return done(null, profile)
  })
)

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/", (req, res) => {
  res.send("<a href='/auth/google/'>Login with Google</a>");
});


app.get(
  "/auth/google",
  passport.authenticate("google", {scope : ["profile", " email"]})
);


app.get ("/auth/google/callback", passport.authenticate('google', {failureRedirect: "/"}), (req, res) => {
  res.redirect('/profile')
})


app.get('/profile', asyncHandler(async (req, res) => {
  const getUserFromGoogle = {
    userName: req.user.displayName,
    email: req.user.emails[0].value,
    password: process.env.password,
  };

  let user = await User.findOne({ email: getUserFromGoogle.email });
  if (user) {
    user.password = undefined;
    const token = createToken(user._id);
    return res.status(200).json({
      message: "Logged in successfully with Google",
      data: user,
      token
    });
  }

  const newUser = await User.create(getUserFromGoogle);
newUser.password = undefined;
const token = createToken(newUser._id);

  res.status(200).json({
    message: "Logged in successfully with Google",
    user: newUser,
    token
  });
}));





app.get("/logout", async(req, res) => {
  try {
    await req.logOut();
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Failed to logout");
  }
});








if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}






//Mount Routes
app.use("/api/v1/categories", require("./routes/categoryRoute"));
app.use("/api/v1/subCategories", require("./routes/subCategoryRoute"));
app.use("/api/v1/story", require("./routes/storyRoute"));
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/favouriteList", require("./routes/wishlistRoute"));
app.use("/api/v1/rating", require("./routes/ratingRoute"));






app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

//global err midleware
app.use(globalError);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App Running on port ${PORT}`);
});

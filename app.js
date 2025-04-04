const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const asyncHandler = require("express-async-handler");
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const compression = require("compression");
const http = require("http"); // ⬅️ استيراد http لإنشاء السيرفر
const socketIo = require("socket.io"); // ⬅️ استيراد WebSocket
const admin = require("./config/firebase"); 
dotenv.config({ path: "config.env" });
const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./midlewares/errmiddleware");
const User = require("./models/userModel");
const createToken = require("./utils/createToken");


dbConnection();

const app = express();
const server = http.createServer(app); 
const io = socketIo(server, { cors: { origin: "*" } }); 

global.io = io;


io.on("connection", (socket) => {
  console.log("🔌 Client connected to WebSocket");

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// Middleware
app.use(compression());
app.use(cors('*'));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));
//app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));


/*app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        user = await User.create({
          uid: profile.id,
          userName: profile.displayName,
          email: profile.emails[0].value,
          profileImg: profile.photos[0].value
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  })
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/", (req, res) => {
  res.send("<a href='/auth/google/'>Login with Google</a>");
});


app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


app.get ("/auth/google/callback", passport.authenticate('google', {failureRedirect: "/"}), (req, res) => {
  res.redirect('/profile')
})


app.get('/profile', asyncHandler(async (req, res) => {
  const getUserFromGoogle = {
    userName: req.user.displayName,
    email: req.user.emails[0].value,
    password: null,
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
    await req.logout();
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Failed to logout");
  }
});*/




// Mount Routes
app.use("/api/v1/categories", require("./routes/categoryRoute"));
app.use("/api/v1/subCategories", require("./routes/subCategoryRoute"));
app.use("/api/v1/story", require("./routes/storyRoute"));
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/favouriteList", require("./routes/wishlistRoute"));
app.use("/api/v1/rating", require("./routes/ratingRoute"));




// Global Error Handler
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});
app.use(globalError);


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

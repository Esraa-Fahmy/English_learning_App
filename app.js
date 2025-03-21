const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const compression = require("compression");
const http = require("http"); // ⬅️ استيراد http لإنشاء السيرفر
const socketIo = require("socket.io"); // ⬅️ استيراد WebSocket
const admin = require("./config/firebase"); 
dotenv.config({ path: "config.env" });
const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./midlewares/errmiddleware");


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
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

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

const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const session = require('express-session');
const compression = require("compression");
const http = require("http"); // ⬅️ استيراد http لإنشاء السيرفر
const socketIo = require("socket.io"); // ⬅️ استيراد WebSocket
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

app.use(cors({
  origin: 'https://e7traf-english.webbing-agency.com',
  credentials: true
}));


app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));





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
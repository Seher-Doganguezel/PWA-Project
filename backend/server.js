const express = require("express");
const mongoose = require("mongoose");
const uploadRoutes = require("./routes/upload.routes");
const postRoutes = require("./routes/post.routes");
const subscriptionRoute = require("./routes/subscription.routes");

require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use("/upload", uploadRoutes);
app.use("/posts", postRoutes);
app.use("/subscription", subscriptionRoute);

// Health Check
app.get("/health", (req, res) => res.status(200).send("OK"));

// Database Connection
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("connected to DB");
});

// General error handler
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Server Start
app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server running on http://localhost:${PORT}`);
  }
});

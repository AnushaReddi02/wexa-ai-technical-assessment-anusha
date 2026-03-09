require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const authRoutes = require("./routes/auth");
const engine = require("ejs-mate");


const app = express();

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/stockflow";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err);
  });

// View Engine Setup
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "stockflowsecret",
    resave: false,
    saveUninitialized: false,
  })
);

//Using auth routes
app.use("/", authRoutes);

// Default Route
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Server Start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
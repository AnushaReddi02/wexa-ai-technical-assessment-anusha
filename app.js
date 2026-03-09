require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const engine = require("ejs-mate");

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const settingsRoutes = require("./routes/Settings");

// Models
const Product = require("./Models/Product");
const Setting = require("./Models/Setting");

const app = express();


// ============================
// MongoDB Connection
// ============================

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/stockflow";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err);
  });


// ============================
// View Engine Setup
// ============================

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ============================
// Middleware
// ============================

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));


// ============================
// Session Configuration
// ============================

app.use(
  session({
    secret: process.env.SESSION_SECRET || "stockflowsecret",
    resave: false,
    saveUninitialized: false,
  })
);


// ============================
// Global Variables for Views
// ============================

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.error = req.query.error;
  res.locals.success = req.query.success;
  next();
});


// ============================
// Authentication Middleware
// ============================

function isLoggedIn(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login?error=loginRequired");
  }
  next();
}


// ============================
// Routes
// ============================

app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/", settingsRoutes);


// ============================
// Dashboard (Protected)
// ============================

app.get("/dashboard", isLoggedIn, async (req, res) => {

  const orgId = req.session.organizationId;

  const products = await Product.find({
    organizationId: orgId
  });

  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0
  );

  const setting = await Setting.findOne({
    organizationId: orgId
  });

  const defaultThreshold = setting
    ? setting.defaultLowStockThreshold
    : 5;

  const lowStockProducts = products.filter(
    p => p.quantity <= (p.lowStockThreshold || defaultThreshold)
  );

  res.render("dashboard", {
    totalProducts,
    totalQuantity,
    lowStockProducts,
    products,
    defaultThreshold
  });

});


// ============================
// Logout Route
// ============================

app.get("/logout", (req, res) => {

  req.session.destroy(err => {

    if (err) {
      console.log(err);
      return res.redirect("/dashboard");
    }

    res.redirect("/login?success=loggedOut");

  });

});


// ============================
// Default Route
// ============================

app.get("/", (req, res) => {
  res.redirect("/login");
});


// ============================
// Server Start
// ============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
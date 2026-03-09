const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../Models/User");
const Organization = require("../Models/Organization");


// Signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});


// Signup logic
router.post("/signup", async (req, res) => {
  const { email, password, organizationName } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const org = new Organization({
    name: organizationName,
  });

  await org.save();

  const user = new User({
    email,
    password: hashedPassword,
    organizationId: org._id,
  });

  await user.save();

  req.session.userId = user._id;
  req.session.organizationId = org._id;

  res.redirect("/dashboard");
});


// Login page
router.get("/login", (req, res) => {
  res.render("login");
});


// Login logic
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.send("Invalid email");
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.send("Invalid password");
  }

  req.session.userId = user._id;
  req.session.organizationId = user.organizationId;

  res.redirect("/dashboard");
});


// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
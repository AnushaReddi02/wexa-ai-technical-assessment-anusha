const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../Models/User");
const Organization = require("../Models/Organization");


// Middleware to prevent logged-in users accessing auth pages
function redirectIfLoggedIn(req, res, next){
  if(req.session.userId){
    return res.redirect("/dashboard");
  }
  next();
}


// ========================
// Signup Page
// ========================

router.get("/signup", redirectIfLoggedIn, (req, res) => {
  res.render("signup");
});


// ========================
// Signup Logic
// ========================

router.post("/signup", async (req, res) => {

  try{

    const { email, password, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if(existingUser){
      return res.send("User already exists. Please login.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization
    const org = new Organization({
      name: organizationName
    });

    await org.save();

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      organizationId: org._id
    });

    await user.save();

    // Start session
    req.session.userId = user._id;
    req.session.organizationId = org._id;

    res.redirect("/dashboard");

  }catch(err){

    console.error(err);
    res.send("Signup failed");

  }

});


// ========================
// Login Page
// ========================

router.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("login");
});


// ========================
// Login Logic
// ========================

router.post("/login", async (req, res) => {

  try{

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user){
      return res.send("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);

    if(!valid){
      return res.send("Invalid email or password");
    }

    req.session.userId = user._id;
    req.session.organizationId = user.organizationId;

    res.redirect("/dashboard");

  }catch(err){

    console.error(err);
    res.send("Login failed");

  }

});


// ========================
// Logout
// ========================

router.get("/logout", (req, res) => {

  req.session.destroy(err => {

    if(err){
      return res.send("Logout failed");
    }

    res.redirect("/login");

  });

});


module.exports = router;
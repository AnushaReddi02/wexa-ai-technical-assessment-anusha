const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../Models/User");
const Organization = require("../Models/Organization");


// Prevent logged-in users from visiting login/signup again
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
  res.render("signup", { error: req.query.error });
});


// ========================
// Signup Logic
// ========================

router.post("/signup", async (req, res) => {

  try{

    const { email, password, organizationName } = req.body;

    const existingUser = await User.findOne({ email });

    if(existingUser){
      return res.redirect("/signup?error=userExists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const org = new Organization({
      name: organizationName
    });

    await org.save();

    const user = new User({
      email,
      password: hashedPassword,
      organizationId: org._id
    });

    await user.save();

    req.session.userId = user._id;
    req.session.organizationId = org._id;

    res.redirect("/dashboard");

  }catch(err){

    console.error(err);
    res.redirect("/signup?error=signupFailed");

  }

});


// ========================
// Login Page
// ========================

router.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("login", { error: req.query.error });
});


// ========================
// Login Logic
// ========================

router.post("/login", async (req, res) => {

  try{

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user){
      return res.redirect("/login?error=invalidCredentials");
    }

    const valid = await bcrypt.compare(password, user.password);

    if(!valid){
      return res.redirect("/login?error=invalidCredentials");
    }

    req.session.userId = user._id;
    req.session.organizationId = user.organizationId;

    res.redirect("/dashboard");

  }catch(err){

    console.error(err);
    res.redirect("/login?error=loginFailed");

  }

});


// ========================
// Logout
// ========================

router.get("/logout", (req, res) => {

  req.session.destroy(err => {

    if(err){
      return res.redirect("/dashboard");
    }

    res.redirect("/login");

  });

});


module.exports = router;
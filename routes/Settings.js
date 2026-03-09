const express = require("express");
const router = express.Router();
const Setting = require("../Models/Setting");


// Show settings page
router.get("/settings", async (req, res) => {

  const orgId = req.session.organizationId;

  if (!orgId) {
    return res.redirect("/login");
  }

  let setting = await Setting.findOne({ organizationId: orgId });

  if (!setting) {
    setting = new Setting({
      organizationId: orgId,
      defaultLowStockThreshold: 5
    });

    await setting.save();
  }

  res.render("settings", { setting });

});


// Update settings
router.post("/settings", async (req, res) => {

  const orgId = req.session.organizationId;

  if (!orgId) {
    return res.redirect("/login");
  }

  await Setting.findOneAndUpdate(
    { organizationId: orgId },
    {
      organizationId: orgId,
      defaultLowStockThreshold: req.body.defaultLowStockThreshold
    },
    {
      upsert: true,
      returnDocument: "after"
    }
  );

  res.redirect("/dashboard");

});

module.exports = router;
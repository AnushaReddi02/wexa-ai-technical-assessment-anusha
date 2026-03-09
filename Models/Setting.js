// models/Setting.js
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  defaultLowStockThreshold: {
    type: Number,
    default: 5
  }
});

module.exports = mongoose.model("Setting", settingSchema);
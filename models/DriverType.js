// models/DriverType.js
const mongoose = require("mongoose");
const database = require('../config/db');
const DriverTypeSchema = new mongoose.Schema({
  driver_type: { type: String, required: true },
  description: { type: String },
});

// Add a static method to find by name
DriverTypeSchema.statics.findByName = function (name) {
  return this.findOne({ name });
};

DriverTypeSchema.statics.findById = function (id) {
  return this.findOne({ _id: mongoose.Types.ObjectId(id) });
};

module.exports = mongoose.model("DriverType", DriverTypeSchema);

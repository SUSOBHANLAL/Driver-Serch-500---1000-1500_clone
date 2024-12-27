// models/DriverType.js
const mongoose = require("mongoose");
const database = require('../config/db');
const RideRequestSchema = new mongoose.Schema({
  driver_id:    { type: String, required: true },
  origin_name:  { type: String },
  origin_lat:   { type: String },
  origin_long:  { type: String },
  dest_name:    { type: String },
  dest_lat:     { type: String },
  dest_long:    { type: String },

});

// Add a static method to find by driver_id
RideRequestSchema.statics.findByDriverId = function (driver_id) {
  return this.findOne({ driver_id });
};

// Add a static method to find by request_id
RideRequestSchema.statics.findById = function (id) {
  return this.findOne({ _id: mongoose.Types.ObjectId(id) });
};

module.exports = mongoose.model("RideRequest", RideRequestSchema);

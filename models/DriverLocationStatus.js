const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  loginTime: { type: Date, required: true, default: Date.now },
  logoutTime: { type: Date },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String },
});

driverSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("DriverLocationStatus", driverSchema);

const mongoose = require("mongoose");

const MgbsTableSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["idle", "active", "busy"],
    default: "idle",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MgbsTableSchema.index({ location: "2dsphere" });

const MgbsTable = mongoose.model("MgbsTable", MgbsTableSchema);

module.exports = MgbsTable;

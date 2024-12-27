const mongoose = require("mongoose");

const FifoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  stationId: { type: String, required: true },
  stationName: { type: String, required: true },
  isFifo: { type: String, default: "yes" },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Fifo", FifoSchema);

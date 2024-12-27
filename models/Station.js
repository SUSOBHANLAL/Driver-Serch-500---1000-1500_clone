const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for the Station model
const stationSchema = new Schema(
  {
    stationId: {
      type: String,
      required: true,
      unique: true, // Ensure stationId is unique
    },
    stationName: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String, // GeoJSON type (always "Point" for a single point)
        enum: ["Point"], // Ensure it is "Point"
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Indexing for geospatial queries
stationSchema.index({ location: "2dsphere" });

const Station = mongoose.model("Station", stationSchema);

module.exports = Station;

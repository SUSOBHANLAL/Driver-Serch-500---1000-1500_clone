const Station = require("../models/Station");

// Controller to create a new station
const createStation = async (req, res) => {
  try {
    const { stationId, stationName, location } = req.body;

    // Validate required fields
    if (
      !stationId ||
      !stationName ||
      !location ||
      !location.type ||
      !location.coordinates
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new station
    const newStation = new Station({
      stationId,
      stationName,
      location,
    });

    // Save the station to the database
    await newStation.save();

    // Return success response
    res
      .status(201)
      .json({ message: "Station created successfully", station: newStation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createStation };

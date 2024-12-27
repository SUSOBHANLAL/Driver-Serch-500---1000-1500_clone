const Driver = require("../models/DriverLocationStatus");

// Get drivers within 5 km radius
// exports.getDriversWithinRadius = async (req, res) => {
//   const { latitude, longitude } = req.body;

//   if (!latitude || !longitude) {
//     return res
//       .status(400)
//       .json({ message: "Latitude and Longitude are required" });
//   }

//   try {
//     // MongoDB geospatial query to find drivers within a 5 km radius
//     const drivers = await Driver.find({
//       location: {
//         $geoWithin: {
//           $centerSphere: [[longitude, latitude], 5 / 6371], // 5 km divided by Earth's radius in km
//         },
//       },
//     });

//     // Sort drivers by loginTime (FIFO)
//     const sortedDrivers = drivers.sort(
//       (a, b) => new Date(a.loginTime) - new Date(b.loginTime)
//     );

//     res.json(sortedDrivers);
//   } catch (err) {
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

// Get drivers within 5 km radius
exports.getDriversWithinRadius = async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "Latitude and Longitude are required" });
  }

  try {
    // MongoDB geospatial query to find drivers within a 5 km radius
    const drivers = await Driver.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], 5 / 6371], // 5 km divided by Earth's radius in km
        },
      },
    });

    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Insert driver details
exports.addDriver = async (req, res) => {
  const { driverId, latitude, longitude, loginTime, status } = req.body;

  // Validate input
  if (!driverId || !latitude || !longitude || !loginTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create a new driver document with geospatial data
    const newDriver = new Driver({
      driverId,
      latitude,
      longitude,
      loginTime,
      status,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    // Save to MongoDB
    const savedDriver = await newDriver.save();

    res.status(201).json({
      message: "Driver added successfully",
      driver: savedDriver,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add driver",
      error: err.message,
    });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    // Fetch all drivers from the database
    const drivers = await Driver.find();

    // Return all drivers as-is
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

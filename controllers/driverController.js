const DriverLocationStatus = require("../models/DriverLocationStatus");

// Add Driver Data
exports.addDriver = async (req, res) => {
  try {
    const { driverId, location, status } = req.body;
    //fifo station chek for 500m
    //if yes, then crete a new collection
    const driver = new DriverLocationStatus({ driverId, location, status });
    await driver.save();
    res.status(201).json({ message: "Driver added successfully", driver });
  } catch (error) {
    res.status(500).json({ message: "Error adding driver", error });
  }
};

// Get Drivers within radius
exports.getDriversWithinRadius = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const drivers = await DriverLocationStatus.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            parseFloat(radius) / 6378.1, // Radius in radians (meters/6378.1)
          ],
        },
      },
    });

    res.status(200).json({ drivers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching drivers", error });
  }
};

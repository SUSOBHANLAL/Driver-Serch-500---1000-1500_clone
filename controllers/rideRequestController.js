// controllers/driverTypeController.js
const RideRequest = require("../models/RideRequest");
const User = require("../models/User");

exports.createRideRequest = async (req, res) => {
  try {
    console.log('in RR controller');
    const driver_id = req.body.driver_id;
    console.log(req.body.driver_id);
    const driver = await User.findById(driver_id);
    console.log('after findbyid');
    if (!driver) {
      return res.status(404).send('Driver not found');
    }

    if (driver.status !== 'idle') {
      return res.status(400).send('Driver is not idle. Ride request cannot be made.');
    }else{
      const ride_req = await RideRequest.create(req.body);
      res.status(201).json(ride_req);
    }
  } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.getRideRequestByDriver = async (req, res) => {
  try {
    const driver_id = req.params.driver_id; // Extract the driver_id
    const id = req.params.id;     // Extract the id
    res.send(`Name: ${driver_id}, ID: ${id}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRideRequestById = async (req, res) => {
  const { id } = req.params;  // Extract the 'id' from the URL params

  try {
    // Find the ride request by the given ID (convert it to ObjectId if needed)
    const ride_req = await RideRequest.findById(id);

    if (!ride_req) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // If vehicle is found, send the data as JSON
    res.status(200).json(ride_req);

  } catch (err) {
    // Handle errors like invalid ID or database connection issues
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

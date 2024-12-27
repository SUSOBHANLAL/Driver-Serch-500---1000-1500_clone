// controllers/driverTypeController.js
const DriverType = require("../models/DriverType");

exports.createDriverType = async (req, res) => {
  try {
    console.log('in controller');
    const driverType = await DriverType.create(req.body);
    res.status(201).json(driverType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDriverTypeByName = async (req, res) => {
  try {
    const name = req.params.name; // Extract the name
    const id = req.params.id;     // Extract the id
    res.send(`Name: ${name}, ID: ${id}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDriverTypeById = async (req, res) => {
  const { id } = req.params;  // Extract the 'id' from the URL params

  try {
    // Find the vehicle by the given ID (convert it to ObjectId if needed)
    const vehicle = await DriverType.findById(id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // If vehicle is found, send the data as JSON
    res.status(200).json(vehicle);

  } catch (err) {
    // Handle errors like invalid ID or database connection issues
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

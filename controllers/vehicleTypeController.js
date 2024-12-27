// controllers/vehicleTypeController.js
const VehicleType = require("../models/VehicleType");

exports.createVehicleType = async (req, res) => {
  try {
    const vehicleType = await VehicleType.create(req.body);
    res.status(201).json(vehicleType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVehicleByName = async (req, res) => {
  try {
    const name = req.params.name; // Extract the name
    const id = req.params.id;     // Extract the id
    res.send(`Name: ${name}, ID: ${id}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVehicle = async (req, res) => {
  const { name, id } = req.params;  // Extract name and id from params

  try {
    let vehicleType;

    // If name is provided, search by name
    if (name) {
      vehicleType = await VehicleType.findByName(name);
    }
    
    // If no vehicle found by name or name is not provided, try to find by ID
    if (!vehicleType && id) {
      vehicleType = await VehicleType.findById(id);
    }

    // Check if a vehicle type is found
    if (vehicleType) {
      res.status(200).json(vehicleType);
    } else {
      res.status(404).json({ error: 'Vehicle not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};


exports.getVehicleById = async (req, res) => {
  const { id } = req.params;  // Extract the 'id' from the URL params

  try {
    // Find the vehicle by the given ID (convert it to ObjectId if needed)
    const vehicle = await VehicleType.findById(id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not foundffffffffff' });
    }

    // If vehicle is found, send the data as JSON
    res.status(200).json(vehicle);

  } catch (err) {
    // Handle errors like invalid ID or database connection issues
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

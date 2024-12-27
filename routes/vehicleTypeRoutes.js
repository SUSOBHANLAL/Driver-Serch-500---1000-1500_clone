const express = require("express");
const { createVehicleType } = require("../controllers/vehicleTypeController");

const vehicleTypeController = require('../controllers/vehicleTypeController');
const router = express.Router();

router.post("/", createVehicleType);

router.get('/:name/', vehicleTypeController.getVehicle);
router.get('/:id/', vehicleTypeController.getVehicleById);

module.exports = router;

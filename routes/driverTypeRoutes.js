const express = require("express");
const { createDriverType } = require("../controllers/driverTypeController");

const driverTypeController = require('../controllers/driverTypeController');
const router = express.Router();

router.post("/", createDriverType);

router.get('/:driver_type/', driverTypeController.getDriverTypeByName);
router.get('/:id/', driverTypeController.getDriverTypeById);

module.exports = router;
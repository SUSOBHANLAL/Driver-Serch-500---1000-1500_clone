// const express = require("express");
// const router = express.Router();
// const { findNearbyDrivers } = require("../controllers/searchDriverController");

// router.get("/drivers", findNearbyDrivers);

// module.exports = router;

const express = require("express");
const {
  getDriversWithinRadius,
} = require("../controllers/searchDriverController");
const { addDriver } = require("../controllers/searchDriverController");

const { getAllDrivers } = require("../controllers/searchDriverController");
const router = express.Router();

router.get("/drivers", getDriversWithinRadius);

router.post("/drivers/add", addDriver);

router.get("/drivers/all", getAllDrivers);

module.exports = router;

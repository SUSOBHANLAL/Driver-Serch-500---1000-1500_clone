const express = require("express");
const {
  addDriver,
  getDriversWithinRadius,
} = require("../controllers/driverController");

const router = express.Router();

// Routes
router.post("/add", addDriver);
router.get("/nearby", getDriversWithinRadius);

module.exports = router;

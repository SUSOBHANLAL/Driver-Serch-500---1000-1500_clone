// routes/stationRoutes.js
const express = require("express");
const router = express.Router();
const stationController = require("../controllers/stationController");

// POST request to create a new station
router.post("/", stationController.createStation);

module.exports = router;

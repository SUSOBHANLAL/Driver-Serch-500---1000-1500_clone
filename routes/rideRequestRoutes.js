// routes/RideRequestRoutes.js
const express = require("express");
const router = express.Router();
const rideRequestController = require("../controllers/rideRequestController");

router.get("/rides", rideRequestController.loadRideRequest);

module.exports = router;

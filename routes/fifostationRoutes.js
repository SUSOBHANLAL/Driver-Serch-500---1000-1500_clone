const express = require("express");
const router = express.Router();
const {
  getNearestFIFOStation,
} = require("../controllers/fifostationController");

// POST route to find the nearest station
router.post("/nearest", getNearestFIFOStation);

module.exports = router;

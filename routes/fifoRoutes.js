const express = require("express");
const router = express.Router();
const { updateFifoTable } = require("../controllers/fifoController");

router.get("/update-fifo", updateFifoTable);

module.exports = router;

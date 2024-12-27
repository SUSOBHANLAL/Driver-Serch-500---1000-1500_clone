require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { haversineDistance } = require("./utils"); // Assuming haversineDistance is implemented in utils.js
const BitsFifo = require("./models/BitsFifo");
const MgbsTable = require("./models/MgbsTable"); // New model for MGBS table
const DriverLocationStatus = require("./models/DriverLocationStatus");
const Station = require("./models/Station"); // Import the Station model
const stationController = require("./controllers/stationController"); // Import the controller

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/fifo", fifoRoutes);
app.use("/api/drivers", driverRoutes);

// Render Main Page
app.get("/", (req, res) => {
  res.render("index");
});

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/drivers", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// Function to find and update the driver location in the "bitsfifo" table
const findAndUpdate = async (newDriver) => {
  try {
    const existingDriver = await BitsFifo.findOne({
      driverId: newDriver.driverId,
    });

    if (existingDriver) {
      // Update the existing driver's location
      existingDriver.location = newDriver.location;
      existingDriver.status = newDriver.status;
      await existingDriver.save();
      console.log("Driver updated in bitsfifo");
    } else {
      // If driver doesn't exist, add a new driver
      await newDriver.save();
      console.log("New driver added to bitsfifo");
    }
  } catch (error) {
    console.error("Error updating driver in bitsfifo:", error);
  }
};

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle random driver input
  socket.on("addRandomDriver", async (data) => {
    try {
      const { latitude, longitude } = data; // Extract random latitude and longitude from the client

      // Fetch all stations
      const stations = await stationController.fetchAllStations();

      let newDriver;
      let nearestStation = null;
      let minDistance = Infinity;

      // Loop through stations and calculate the distance
      for (const station of stations) {
        const [stationLongitude, stationLatitude] =
          station.location.coordinates;
        const distance = haversineDistance(
          latitude,
          longitude,
          stationLatitude,
          stationLongitude
        );

        if (distance <= 500 && distance < minDistance) {
          minDistance = distance;
          nearestStation = station; // Find the nearest station within 500 meters
        }
      }

      // If a nearby station is found, add the driver with the station ID
      if (nearestStation) {
        console.log(`Driver is near ${nearestStation.stationName}`);

        newDriver = new DriverLocationStatus({
          driverId: `driver-${Math.random().toString(36).substr(2, 5)}`,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          status: "idle",
          stationId: nearestStation.stationId, // Assign the station ID to the driver
        });

        await newDriver.save();
        io.emit("driverAdded", newDriver);
      } else {
        console.log("Driver is not near any known station");

        // If no station is found nearby, just add to DriverLocationStatus without station ID
        newDriver = new DriverLocationStatus({
          driverId: `driver-${Math.random().toString(36).substr(2, 5)}`,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          status: "idle",
        });

        await newDriver.save();
        io.emit("driverAdded", newDriver);
      }
    } catch (error) {
      console.error("Error adding random driver:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

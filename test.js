require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const connectDB = require("./config/db");
const driverRoutes = require("./routes/driverRoutes");
const fifoRoutes = require("./routes/fifoRoutes");
const stationRoutes = require("./routes/stationRoutes");
const DriverLocationStatus = require("./models/DriverLocationStatus");
const BitsFifo = require("./models/BitsFifo");
const Station = require("./models/Station"); // Import the Station model
const fifoStationRoutes = require("./routes/fifostationRoutes");

// Initialize App and Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicle-type/", require("./routes/vehicleTypeRoutes"));
app.use("/api/driver-type/", require("./routes/driverTypeRoutes"));
app.use(
  "/api/driver-vehicle-details",
  require("./routes/driverVehicleDetailsRoutes")
);
app.use("/api/driver-status", require("./routes/driverStatusRoutes"));
app.use("/api/available-drivers", require("./routes/driverRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));
// app.use("/api/ride-request", require("./routes/rideRequestRoutes"));
app.use("/api/fifo", fifoRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/fifostations", fifoStationRoutes);

// Render Main Page
app.get("/", (req, res) => {
  res.render("index");
});

// Haversine formula to calculate distance between two lat/lng points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Distance in meters
};

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle random driver input
  socket.on("addRandomDriver", async (data) => {
    try {
      const { latitude, longitude, driverId } = data; // Include driverId from client if available

      // Check if the driver already exists in either BitsFifo or DriverLocationStatus collection
      let existingDriver = await BitsFifo.findOne({ driverId });
      if (!existingDriver) {
        existingDriver = await DriverLocationStatus.findOne({ driverId });
      }

      if (existingDriver) {
        // Update the driver's coordinates
        existingDriver.location = {
          type: "Point",
          coordinates: [longitude, latitude],
        };

        // Save the updated driver document
        await existingDriver.save();

        console.log("Driver's location updated:", existingDriver);

        // Emit the updated driver
        io.emit("driverUpdated", existingDriver);
      } else {
        // Fetch all stations from the database
        const stations = await Station.find();

        // Find the nearest station
        let nearestStation = null;
        let minDistance = Infinity;
        let arrivalTime = null;

        stations.forEach((station) => {
          const distanceToStation = haversineDistance(
            latitude,
            longitude,
            station.location.coordinates[1],
            station.location.coordinates[0]
          );

          // Check if the driver is within 500 meters of a station
          if (distanceToStation <= 500 && distanceToStation < minDistance) {
            nearestStation = station;
            minDistance = distanceToStation;
            arrivalTime = new Date(); // Set arrival time to current time when the driver reaches the station
          }
        });

        if (nearestStation) {
          console.log("Driver is near a station.", nearestStation);
          console.log("Distance to nearest station:", minDistance);
          console.log("Arrival Time:", arrivalTime);

          // Add driver data to the station with arrival time
          const newDriver = new BitsFifo({
            driverId:
              driverId || `driver-${Math.random().toString(36).substr(2, 5)}`, // Use provided driverId or generate a new one
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            stationName: nearestStation.stationName,
            status: "idle",
            stationId: nearestStation.stationId, // Link driver with the station
            arrivalTime: arrivalTime, // Set the arrival time when the driver reaches the station
          });

          await newDriver.save();

          // Emit the newly added driver with station details
          io.emit("driverAdded", {
            driver: newDriver,
            station: nearestStation,
          });
        } else {
          // If no station is within 500 meters, save the driver to the DriverLocationStatus table
          const newDriver = new DriverLocationStatus({
            driverId:
              driverId || `driver-${Math.random().toString(36).substr(2, 5)}`, // Use provided driverId or generate a new one
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            status: "idle",
          });

          await newDriver.save();

          // Emit the newly added driver
          io.emit("driverAdded", newDriver);
        }
      }
    } catch (error) {
      console.error("Error adding or updating driver:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

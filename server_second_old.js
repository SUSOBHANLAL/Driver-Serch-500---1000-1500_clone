require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const connectDB = require("./config/db");
const driverRoutes = require("./routes/driverRoutes");
const DriverLocationStatus = require("./models/DriverLocationStatus");
const BitsFifo = require("./models/BitsFifo");
const fifoRoutes = require("./routes/fifoRoutes");

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
app.use("/api/fifo", fifoRoutes);
app.use("/api/drivers", driverRoutes);

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
      const { latitude, longitude } = data; // Extract random latitude and longitude from the client

      // Ameerpet coordinates
      const ameerpetCoords = [78.44449563589029, 17.435768370541712];
      const mgbscords = [78.48572931611685, 17.378502778550786];

      // Calculate distance from generated location to Ameerpet
      const distance = haversineDistance(
        latitude,
        longitude,
        ameerpetCoords[1],
        ameerpetCoords[0]
      );

      if (distance <= 500) {
        console.log("This is the distance", distance);
        console.log("This is the latitude", latitude);
        console.log("This is the longitude", longitude);

        // If within 500 meters, insert into "bitsfifo" and run the update function
        const newDriver = new BitsFifo({
          driverId: `driver-${Math.random().toString(36).substr(2, 5)}`,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          status: "idle",
        });

        // Function to find and update the driver location in bitsfifo
        await findAndUpdate(newDriver);

        // Emit the newly added driver to all clients
        io.emit("driverAdded", newDriver);
      } else {
        // If outside 500 meters, add to "DriverLocationStatus"
        const newDriver = new DriverLocationStatus({
          driverId: `driver-${Math.random().toString(36).substr(2, 5)}`,
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
    } catch (error) {
      console.error("Error adding random driver:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Function to find and update the driver location in the "bitsfifo" table
const findAndUpdate = async (newDriver) => {
  try {
    // Example: Look for an existing driver in bitsfifo and update if necessary
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

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

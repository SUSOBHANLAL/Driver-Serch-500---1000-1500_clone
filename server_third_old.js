const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { haversineDistance } = require("./utils"); // Assuming haversineDistance is implemented in utils.js
const BitsFifo = require("./models/BitsFifo");
const DriverLocationStatus = require("./models/DriverLocationStatus");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/drivers", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle random driver input
  socket.on("addRandomDriver", async (data) => {
    try {
      const { latitude, longitude } = data; // Extract random latitude and longitude from the client

      const ameerpetCoords = [78.44449563589029, 17.435768370541712]; // Ameerpet coordinates
      const mgbscords = [78.48572931611685, 17.378502778550786]; // MGBS coordinates

      // Calculate distances from generated location to Ameerpet and MGBS
      const distanceToAmeerpet = haversineDistance(
        latitude,
        longitude,
        ameerpetCoords[1],
        ameerpetCoords[0]
      );

      const distanceToMGBS = haversineDistance(
        latitude,
        longitude,
        mgbscords[1],
        mgbscords[0]
      );

      // Check if the driver is within 500 meters of either station
      if (distanceToAmeerpet <= 500 || distanceToMGBS <= 500) {
        console.log("Driver is near a station.");
        console.log("Distance to Ameerpet:", distanceToAmeerpet);
        console.log("Distance to MGBS:", distanceToMGBS);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

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
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

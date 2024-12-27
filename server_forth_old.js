const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { haversineDistance } = require("./utils"); // Assuming haversineDistance is implemented in utils.js
const BitsFifo = require("./models/BitsFifo");
const MgbsTable = require("./models/MgbsTable"); // New model for MGBS table
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

      const referenceCoordinates = {
        ameerpet: [78.44449563589029, 17.435768370541712],
        mgbs: [78.48572931611685, 17.378502778550786],
      };

      // Calculate distances to both Ameerpet and MGBS
      const distanceToAmeerpet = haversineDistance(
        latitude,
        longitude,
        referenceCoordinates.ameerpet[1],
        referenceCoordinates.ameerpet[0]
      );
      const distanceToMGBS = haversineDistance(
        latitude,
        longitude,
        referenceCoordinates.mgbs[1],
        referenceCoordinates.mgbs[0]
      );

      let newDriver;

      if (distanceToAmeerpet <= 500) {
        console.log("Driver is near Ameerpet");

        // Add to BitsFifo for Ameerpet
        newDriver = new BitsFifo({
          driverId: `driver-${Math.random().toString(36).substr(2, 5)}`,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          status: "idle",
        });

        await findAndUpdate(newDriver); // Ensure findAndUpdate function is defined
        io.emit("driverAdded", newDriver);
      } else if (distanceToMGBS <= 500) {
        console.log("Driver is near MGBS");

        // Add to MgbsTable for MGBS
        newDriver = new MgbsTable({
          driverId: `driver-${Math.random().toString(36).substr(2, 5)}`,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          status: "idle",
        });

        await newDriver.save();
        io.emit("driverAdded", newDriver);
      } else {
        console.log("Driver is not near any known station");

        // Add to DriverLocationStatus for drivers outside the proximity
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

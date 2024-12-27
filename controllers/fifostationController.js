/////////////////////////////////////////
//
//////////////////////////////////
const FIFOStation = require("../models/BitsFifo");
const Station = require("../models/Station");
const DriverLocationStatus = require("../models/DriverLocationStatus");

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degree) => degree * (Math.PI / 180);

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// Find the nearest station and handle fallback to driver search
const getNearestFIFOStation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    // Fetch all stations
    const stations = await Station.find();
    const fifoStations = await FIFOStation.find();

    let nearestStation = null;
    let minDistance = 500;

    // Find the nearest station
    stations.forEach((station) => {
      const [stationLon, stationLat] = station.location.coordinates;
      const distance = calculateDistance(
        latitude,
        longitude,
        stationLat,
        stationLon
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = station;
      }
    });

    // If no nearest station, fallback to driver search using normal serach algorithm
    if (!nearestStation) {
      const radius = 5; // Default radius in kilometers
      const drivers = await DriverLocationStatus.find({
        location: {
          $geoWithin: {
            $centerSphere: [
              [parseFloat(longitude), parseFloat(latitude)],
              radius / 6378.1, // Radius in radians
            ],
          },
        },
      });

      if (drivers.length === 0) {
        return res
          .status(404)
          .json({ message: "No stations or drivers found nearby" });
      }

      return res
        .status(200)
        .json({ message: "Fallback to driver search", drivers });
    }

    // Find FIFOStations near the nearest station
    const nearestStationLat = nearestStation.location.coordinates[1];
    const nearestStationLon = nearestStation.location.coordinates[0];
    let nearestFIFOStations = [];
    const fifoSearchRadius = 1; // Adjust radius as needed (in kilometers)

    fifoStations.forEach((fifoStation) => {
      const [fifoLon, fifoLat] = fifoStation.location.coordinates;
      const distanceToFIFO = calculateDistance(
        nearestStationLat,
        nearestStationLon,
        fifoLat,
        fifoLon
      );

      if (distanceToFIFO <= fifoSearchRadius) {
        nearestFIFOStations.push({
          fifoStation,
          distance: distanceToFIFO,
        });
      }
    });

    // Sort FIFOStations by createdAt time (FIFO order: oldest first)
    nearestFIFOStations.sort(
      (a, b) =>
        new Date(a.fifoStation.createdAt) - new Date(b.fifoStation.createdAt)
    );

    res.status(200).json({
      nearestStation,
      stationDistance: minDistance,
      nearestFIFOStations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = { getNearestFIFOStation };

//////////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////////
// const FIFOStation = require("../models/BitsFifo");
// const Station = require("../models/Station"); // Import the Station model
// const DriverLocationStatus = require("../models/DriverLocationStatus"); // Assuming you're using this for the normal search

// // Helper function to calculate distance between two points (Haversine formula)
// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   const toRadians = (degree) => degree * (Math.PI / 180);

//   const R = 6371; // Radius of Earth in kilometers
//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(lat1)) *
//       Math.cos(toRadians(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in kilometers
// };

// // Find the nearest station
// const getNearestFIFOStation = async (req, res) => {
//   try {
//     const { latitude, longitude } = req.body;

//     if (!latitude || !longitude) {
//       return res
//         .status(400)
//         .json({ message: "Latitude and longitude are required" });
//     }

//     const metrostations = await Station.find();
//     const stations = await FIFOStation.find(); // Fetch all stations

//     if (!stations || stations.length === 0) {
//       return res.status(404).json({ message: "No stations available" });
//     }

//     // Initialize minDistance to a large value (Infinity)
//     let nearestStation = null;
//     let minDistance = Infinity; // Initialize minDistance here
//     metrostations.forEach((metrostations) => {
//       const distanceToMetroStation = calculateDistance(
//         latitude,
//         longitude,
//         metrostations.location.coordinates[1],
//         metrostations.location.coordinates[0]
//       );

//       if (
//         distanceToMetroStation <= 500 &&
//         distanceToMetroStation < minDistance
//       ) {
//         nearestStation = metrostations;
//         minDistance = distanceToMetroStation;
//         console.log("This is the nearest metro station", nearestStation);
//       }
//     });

//     // If no nearest station is found, perform the normal search for drivers within the radius
//     if (!nearestStation) {
//       const { radius } = req.query; // radius is expected in the query params
//       const drivers = await DriverLocationStatus.find({
//         location: {
//           $geoWithin: {
//             $centerSphere: [
//               [parseFloat(longitude), parseFloat(latitude)],
//               parseFloat(radius) / 6378.1, // Radius in radians (meters/6378.1)
//             ],
//           },
//         },
//       });

//       return res
//         .status(200)
//         .json({
//           message: "No nearest station found. Proceeding with normal search.",
//           drivers,
//         });
//     } else {
//       // Find FIFOStations near the nearest station
//       const nearestStationLat = nearestStation.location.coordinates[1];
//       const nearestStationLon = nearestStation.location.coordinates[0];
//       let nearestFIFOStations = [];
//       const fifoSearchRadius = 1; // Adjust radius as needed (in kilometers)

//       fifoStations.forEach((fifoStation) => {
//         const [fifoLon, fifoLat] = fifoStation.location.coordinates;
//         const distanceToFIFO = calculateDistance(
//           nearestStationLat,
//           nearestStationLon,
//           fifoLat,
//           fifoLon
//         );

//         if (distanceToFIFO <= fifoSearchRadius) {
//           nearestFIFOStations.push({
//             fifoStation,
//             distance: distanceToFIFO,
//           });
//         }
//       });

//       // Sort FIFOStations by createdAt time (FIFO order: oldest first)
//       nearestFIFOStations.sort(
//         (a, b) =>
//           new Date(a.fifoStation.createdAt) - new Date(b.fifoStation.createdAt)
//       );

//       res.status(200).json({
//         nearestStation,
//         stationDistance: minDistance,
//         nearestFIFOStations,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

// module.exports = { getNearestFIFOStation };

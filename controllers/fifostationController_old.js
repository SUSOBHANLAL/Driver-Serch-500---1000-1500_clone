const FIFOStation = require("../models/BitsFifo");
const Station = require("../models/Station"); // Import the Station model

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degree) => degree * (Math.PI / 180);

  const R = 6371; // Radius of Earth in kilometers
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

// Find the nearest station
const getNearestFIFOStation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }
    const metrostations = await Station.find();
    const stations = await FIFOStation.find(); // Fetch all stations

    if (!stations || stations.length === 0) {
      return res.status(404).json({ message: "No stations available" });
    }

    // Find the nearest station

    let nearestMetroStation = null;
    let minMetroDistance = Infinity;
    let arrivalTimeMetro = null;
    metrostations.forEach((metrostations) => {
      const distanceTometroStation = calculateDistance(
        latitude,
        longitude,
        metrostations.location.coordinates[1],
        metrostations.location.coordinates[0]
      );

      if (
        distanceTometroStation <= 500 &&
        distanceTometroStation < minDistance
      ) {
        nearestMetroStation = metrostations;
        minMetroDistance = distanceTometroStation;
        console.log("thsi is the near metro  station", nearestMetroStation);
      }
    });

    let nearestStation = null;
    let minDistance = 250;

    stations.forEach((station) => {
      console.log("Station", station);
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

    if (!nearestStation) {
      return res.status(404).json({ message: "No stations found nearby" });
    }

    res.status(200).json({ nearestStation, distance: minDistance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getNearestFIFOStation };

//////////////////////////////////////////////////////////////
//FETCH NEAREST DRIVER LIST USING GOOGLE API//////////////////
//////////////////////////////////////////////////////////////

// const FIFOStation = require("../models/BitsFifo");
// const axios = require("axios"); // Ensure axios is installed and imported

// // Helper function to calculate distance using Google Maps API
// const calculateDistanceUsingGoogleAPI = async (lat1, lon1, lat2, lon2) => {
//   const apiKey = "AIzaSyAb3441ZSzyHBhjWdA0_5mh0hsYDOM0oD0"; // Replace with your API Key
//   const origin = `${lat1},${lon1}`;
//   const destination = `${lat2},${lon2}`;
//   const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;

//   try {
//     const response = await axios.get(url);
//     const data = response.data;

//     if (data.rows[0].elements[0].status === "OK") {
//       const distanceInMeters = data.rows[0].elements[0].distance.value; // Distance in meters
//       const distanceInKilometers = distanceInMeters / 1000; // Convert to kilometers
//       return distanceInKilometers;
//     } else {
//       throw new Error(`Error: ${data.rows[0].elements[0].status}`);
//     }
//   } catch (error) {
//     console.error("Error calculating distance:", error);
//     return null;
//   }
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

//     const stations = await FIFOStation.find(); // Fetch all stations

//     if (!stations || stations.length === 0) {
//       return res.status(404).json({ message: "No stations available" });
//     }

//     // Find the nearest station
//     let nearestStation = null;
//     let minDistance = 500;

//     for (const station of stations) {
//       console.log("Station", station);
//       const [stationLon, stationLat] = station.location.coordinates;
//       const distance = await calculateDistanceUsingGoogleAPI(
//         latitude,
//         longitude,
//         stationLat,
//         stationLon
//       );

//       if (distance !== null && distance < minDistance) {
//         minDistance = distance;
//         nearestStation = station;
//       }
//     }

//     if (!nearestStation) {
//       return res.status(404).json({ message: "No stations found nearby" });
//     }

//     res.status(200).json({ nearestStation, distance: minDistance });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// module.exports = { getNearestFIFOStation };

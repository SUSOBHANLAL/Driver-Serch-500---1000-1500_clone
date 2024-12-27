const Fifo = require("../models/Fifo");
const DriverLocationStatus = require("../models/DriverLocationStatus");

exports.updateFifoTable = async (req, res) => {
  console.log("Fifi  has been updated");
  try {
    const { latitude, longitude } = req.query;
    const ameerpet = {
      latitude: 17.3005372696588,
      longitude: 78.39926408384103,
    }; // Ameerpet Metro coordinates
    const radius = 500; // in meters

    const drivers = await DriverLocationStatus.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(ameerpet.longitude), parseFloat(ameerpet.latitude)],
            radius / 6378.1,
          ],
        },
      },
    });

    for (const driver of drivers) {
      await Fifo.updateOne(
        { userId: driver.driverId },
        {
          $set: {
            stationId: "station1",
            stationName: "ameerpet",
            isFifo: "yes",
            latitude: ameerpet.latitude,
            longitude: ameerpet.longitude,
          },
        },
        { upsert: true }
      );
    }

    res.status(200).json({ message: "FIFO table updated", drivers });
  } catch (error) {
    res.status(500).json({ message: "Error updating FIFO table", error });
  }
};

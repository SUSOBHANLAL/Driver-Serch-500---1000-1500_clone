// const socket = io();

// // Handle "Add Random Driver" button click
// document.getElementById("addDriverBtn").addEventListener("click", () => {
//   socket.emit("addRandomDriver");
// });

// // Listen for newly added drivers
// socket.on("driverAdded", (driver) => {
//   const driversList = document.getElementById("driversList");
//   const driverItem = document.createElement("li");
//   driverItem.textContent = `ID: ${driver.driverId}, Location: (${driver.location.coordinates[1]}, ${driver.location.coordinates[0]})`;
//   driversList.appendChild(driverItem);
// });

const socket = io();

let intervalId = null;

// Handle "Add Random Driver" button click
// document.getElementById("addDriverBtn").addEventListener("click", () => {
//   if (!intervalId) {
//     intervalId = setInterval(() => {
//       socket.emit("addRandomDriver");
//     }, 1000); // Send data every second
//   }
// });

document.getElementById("addDriverBtn").addEventListener("click", () => {
  if (!intervalId) {
    intervalId = setInterval(() => {
      const referenceLongitude = 78.44449563589029; // Ameerpet
      const referenceLatitude = 17.435768370541712; // Ameerpet

      // const referenceLongitude = 78.48572931611685; // mgbs
      // const referenceLatitude = 17.378502778550786; // mgbs

      const maxOffset = 500 / 111000; // Approx. 500 meters in degrees

      // Generate random latitude and longitude within 500 meters
      const randomLongitude =
        referenceLongitude +
        ((Math.random() * 2 - 1) * maxOffset) /
          Math.cos(referenceLatitude * (Math.PI / 180));
      const randomLatitude =
        referenceLatitude + (Math.random() * 2 - 1) * maxOffset;

      // Emit the generated coordinates to the server
      socket.emit("addRandomDriver", {
        latitude: randomLatitude,
        longitude: randomLongitude,
      });
    }, 1000); // Send data every second
  }
});

// Stop adding random drivers when "Stop Adding" button is clicked
document.getElementById("stopAddingBtn").addEventListener("click", () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
});

// Listen for newly added drivers
socket.on("driverAdded", (driver) => {
  const driversList = document.getElementById("driversList");
  const driverItem = document.createElement("li");
  driverItem.textContent = `ID: ${driver.driverId}, Location: (${driver.location.coordinates[1]}, ${driver.location.coordinates[0]})`;
  driversList.appendChild(driverItem);
});

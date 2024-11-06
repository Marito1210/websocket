// csvReader.js
const fs = require('fs');
const csv = require('csv-parser');

let devices = []; // Aquí se almacenan los dispositivos leídos del CSV

// Función para leer el archivo CSV y cargar los dispositivos
function readCSV(filePath, callback) {
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const deviceData = {
        deviceid: parseInt(row.deviceid),
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        altitude: parseFloat(row.altitude),
        speed: parseFloat(row.speed),
        course: parseFloat(row.course),
        servertime: row.servertime,
        valid: parseInt(row.valid)
      };
      devices.push(deviceData);
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      callback(devices); // Llamar el callback para retornar los dispositivos
    });
}

module.exports = { readCSV };

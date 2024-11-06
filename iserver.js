// webSocketServer.js
const WebSocket = require('ws');
const { readCSV } = require('./index'); // Importar la función de lectura del CSV

// Crear el servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({host: '0.0.0.0', port: 8080 });
console.log('WebSocket server running on ws://192.168.1.10:8080');

// Almacenar los clientes conectados
let clients = [];

// Cuando un cliente se conecta al servidor WebSocket
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.push(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== ws); // Eliminar el cliente desconectado
  });
});

// Función para enviar datos a todos los clientes conectados cada 30 segundos
function sendData(devices) {
  let index = 0;

  if (devices.length === 0) {
    console.log('No hay datos en el archivo CSV.');
    return;
  }

  setInterval(() => {
    const device = devices[index];

    console.log(`Enviando datos del dispositivo en el índice: ${index}`);  // Agregar log del índice
    console.log(`Datos del dispositivo:`, device);  // Log de los datos del dispositivo
    
    if (device.valid === 1) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(device), (err) => {
            if (err) {
              console.error('Error sending data:', err);
            } else {
              console.log('Data sent:', device);
            }
          });
        }
      });
    } else {
      console.log('Invalid location data, skipping:', device);
    }

    // Incrementar el índice y ciclar por los dispositivos
    index = (index + 1) % devices.length; // Usamos el módulo (%) para ciclar por la lista
  }, 30000);  // 30 segundos
}


// Leer el archivo CSV y empezar a enviar los datos
readCSV('devices.csv', (devices) => {
  console.log('Datos cargados:', devices);  // Mostrar los datos cargados
  sendData(devices);  // Iniciar el envío de datos una vez cargados
});

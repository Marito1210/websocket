const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); // Librería para generar IDs únicos
const mysql = require('mysql2');

// Configurar la conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Reemplaza con tu usuario de MySQL
  password: 'root', // Reemplaza con tu contraseña de MySQL
  database: 'chat_db', // Reemplaza con el nombre de tu base de datos
  port: 3305 // Asegúrate de incluir el puerto correcto aquí
});


// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos exitosa');
});

// Configurar el servidor WebSocket
const wss = new WebSocket.Server({ port: 3000, host: '0.0.0.0' });

wss.on('connection', (ws) => {
  // Asignar un userId único a cada cliente que se conecte
  const userId = uuidv4();
  console.log(`Nuevo cliente conectado con ID: ${userId}`);

  // Enviar el userId al cliente recién conectado
  ws.send(JSON.stringify({ userId }));

  // Cargar el historial de mensajes y enviarlo al cliente recién conectado
  connection.query('SELECT * FROM messages ORDER BY created_at ASC', (err, results) => {
    if (err) {
      console.error('Error al obtener el historial de mensajes:', err);
    } else {
      results.forEach((row) => {
        ws.send(JSON.stringify({
          userId: row.user_id,
          text: row.text,
          createdAt: row.created_at
        }));
      });
    }
  });

  // Escuchar mensajes de los clientes
  ws.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`);

    // Decodificar el mensaje recibido (si es un JSON)
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      console.error("Error al parsear el mensaje:", error);
      return;
    }

    // Incluir el userId en el mensaje
    const messageWithUserId = {
      userId: userId,
      text: parsedMessage.text,
    };

    // Guardar el mensaje en la base de datos
    connection.query(
      'INSERT INTO messages (user_id, text) VALUES (?, ?)',
      [userId, parsedMessage.text],
      (err) => {
        if (err) {
          console.error('Error al guardar el mensaje:', err);
        } else {
          console.log('Mensaje guardado correctamente en la base de datos');
        }
      }
    );

    // Reenviar el mensaje a todos los clientes conectados
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageWithUserId));
      }
    });
  });

  ws.on('close', () => {
    console.log(`Cliente con ID ${userId} desconectado`);
  });
});

console.log('Servidor WebSocket en ejecución en ws://0.0.0.0:3000');

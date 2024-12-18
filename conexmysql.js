const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // Para analizar JSON en el cuerpo de las solicitudes

// Configuración de la conexión MySQL
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'chat_backup',
    port: 3305,
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conexión a MySQL establecida');
});

// Endpoint para obtener los chats
app.post('/get-chats', (req, res) => {
    // Obtén los parámetros del cuerpo de la solicitud
    const { startDate, endDate, senderId, receiverId } = req.body;

    // Validación básica
    if (!startDate || !endDate || !senderId || !receiverId) {
        return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
    }

    // Consulta parametrizada para evitar inyección SQL
    const query = `
        SELECT * FROM chats
        WHERE timestamp BETWEEN ? AND ?
        AND (
            (senderId = ? AND receiverId = ?)
            OR (senderId = ? AND receiverId = ?)
        )
        ORDER BY timestamp DESC
    `;

    const values = [startDate, endDate, senderId, receiverId, receiverId, senderId];

    // Ejecutar la consulta
    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener los datos' });
        }
        res.json(results); // Devolver los resultados como JSON
    });
});

// Inicia el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://192.168.1.10:3000');
});

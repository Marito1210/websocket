const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost', // Cambia esto si no es el host correcto
  user: "root",
  password: "root",
  database: "mensajeria",
  port: 3305, // Puerto en el que está ejecutándose MySQL
});

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    return;
  }
  console.log("Conexión exitosa a la base de datos.");
});

const PORT = 3000;

app.post("/enviar-mensaje", (req, res) => {// endpoint POST que permite a los usuarios enviar un mensaje.
  const { emisor_uid, receptor_uid, mensaje } = req.body; //Extrae los datos del cuerpo de la solicitud (emisor, receptor y mensaje).

  if (!emisor_uid || !receptor_uid || !mensaje) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
//Inserta un nuevo registro en la tabla mensajes de la base de datos.
  const sql = "INSERT INTO mensajes (emisor_uid, receptor_uid, mensaje) VALUES (?, ?, ?)";
  db.query(sql, [emisor_uid, receptor_uid, mensaje], (err, result) => {
    if (err) {
      console.error("Error al insertar mensaje:", err);
      return res.status(500).json({ error: "Error al guardar el mensaje." });
    }
    res.status(200).json({ message: "Mensaje enviado con éxito." });
  });
});

app.get("/obtener-mensajes", (req, res) => {  //endpoint GET que permite a los usuarios obtener los mensajes entre dos usuarios.
  const { emisor_uid, receptor_uid } = req.query; 
//Inserta un nuevo registro en la tabla mensajes de la base de datos.
  if (!emisor_uid || !receptor_uid) {
    return res.status(400).json({ error: "Emisor y receptor son obligatorios." });
  }
//Ejecuta una consulta a la base de datos para obtener los mensajes relevantes.
  const sql = `
    SELECT * FROM mensajes 
    WHERE 
      (emisor_uid = ? AND receptor_uid = ?) OR 
      (emisor_uid = ? AND receptor_uid = ?)
    ORDER BY fecha_envio ASC
  `;
  db.query(sql, [emisor_uid, receptor_uid, receptor_uid, emisor_uid], (err, results) => {
    if (err) {
      console.error("Error al obtener mensajes:", err);
      return res.status(500).json({ error: "Error al obtener los mensajes." });
    }
    res.status(200).json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://192.168.1.10:${PORT}`);
});

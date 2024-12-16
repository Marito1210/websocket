const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();


// Habilitar CORS y manejo de JSON
app.use(
  cors({
    origin: '*', // Permite solicitudes desde cualquier origen
    credentials: true,
  })
);
app.use(bodyParser.json());

// Cargar datos del archivo JSON
const jsonData = JSON.parse(fs.readFileSync('jsondata.json', 'utf8'));

// Variable para almacenar el usuario logueado
let loggedInUser = null;

// Ruta para validar el email y la contraseña
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Datos recibidos del cliente:', req.body);
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'El email y la contraseña son obligatorios.',
    });
  }

  // Buscar el usuario en el arreglo de usuarios
  const user = jsonData.find(u => u.email === email && u.password === password);

  if (user) {
    loggedInUser = user; // Guardar el usuario como logueado
    return res.status(200).json({
      success: true,
      message: 'Credenciales válidas.',
      user,
    });
  }

  // Si el email o la contraseña no coinciden
  res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
});

app.get('/users', (req, res) => {
  // Obtener solo los campos name y email de cada usuario
  const usersList = jsonData.map(user => ({
    name: user.name,
    email: user.email
  }));

  res.status(200).json({
    success: true,
    users: usersList
  });
});



// Configurar el puerto del servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://192.168.1.10:${PORT}`);
});

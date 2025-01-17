const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/UserRoutes'); // Importamos las rutas de usuario

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Conectar a MongoDB
mongoose.connect('mongodb+srv://alvmaycre:90876@hotelperemaria.8ljrv.mongodb.net/DataBase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/status', (req, res) => {
  res.send('Está conectado');
});

// Rutas
app.use('/users', userRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



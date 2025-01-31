const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/UserRoutes');
const reservaRoutes = require('./routes/ReservaRoutes');
const habitacionRoutes = require('./routes/HabitacionRoutes');
const tipoHabitacionRoutes = require('./routes/TipoHabitacionRoutes');
const path = require('path');

const app = express();
const PORT = 3000;

//middleware
app.use(bodyParser.json());

//conectar a la base de datos
//mongoose.connect('mongodb+srv://alvmaycre:90876@hotelperemaria.8ljrv.mongodb.net/DataBase', {
//  useNewUrlParser: true,
//  useUnifiedTopology: true,
//});

mongoose.connect('mongodb+srv://alvmaycre:90876@hotelperemaria.8ljrv.mongodb.net/DataBase')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

//endpoint para var si se conencta con la base de datos (en principio no necesitamos usarlo ya más, pero lo dejo por si acaso 
//pq puede que sirva de algo a la hora de hacer el resto de endpoints)
app.get('/status', (req, res) => {
  res.send('Está conectado');
});

//rutas
app.use('/users', userRoutes);
app.use('/reservas', reservaRoutes);
app.use('/habitaciones', habitacionRoutes);
app.use('/tipos-habitacion', tipoHabitacionRoutes);

//imagenes estáticas
app.use('/images', express.static(path.join(__dirname, 'images')));

//iniciar el server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



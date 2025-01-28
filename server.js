const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/UserRoutes');
const reservaRoutes = require('./routes/ReservaRoutes');

const app = express();
const PORT = 3000;

//middleware
app.use(bodyParser.json());

//conectar a la base de datos
mongoose.connect('mongodb+srv://alvmaycre:90876@hotelperemaria.8ljrv.mongodb.net/DataBase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//endpoint para var si se conencta con la base de datos (en principio no necesitamos usarlo ya más, pero lo dejo por si acaso 
//pq puede que sirva de algo a la hora de hacer el resto de endpoints)
app.get('/status', (req, res) => {
  res.send('Está conectado');
});

//rutas
app.use('/users', userRoutes);
app.use('/reservas', reservaRoutes)

//iniciar el server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



const mongoose = require('mongoose');

const TipoHabitacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  precioBase: {
    type: Number,
    required: true,
    min: 0,
  },
  capacidadMaxima: {
    type: Number,
    required: true,
    min: 1,
  },
  servicios: {
    type: [String],
    default: [],
  }
}, {
  collection: 'TiposHabitacion'
});

const TipoHabitacion = mongoose.model('TipoHabitacion', TipoHabitacionSchema);
module.exports = TipoHabitacion;

const mongoose = require('mongoose');
const Counter = require('./CounterModel');

const HabitacionSchema = new mongoose.Schema({
  idHabitacion: {
    type: Number, 
    trim: true,
    required: true,
  },
  precio: {
    type: Number,
    trim: true,
    default: 0, 
    min: 0,
  },
  tipoHabitacion: {
    type: String,
    enum: ['Sencilla', 'Doble', 'Triple', 'Suite'],
    required: true,
  },
  numPersonas: {
    type: Number,
    trim: true,
    default: 0, 
  },
  estado: {
    type: String,
    enum: ['Disponible', 'Mantenimiento'],
    default: 'Disponible',
  },
  imagenes: {
    type: [String],
    default: [],
  },
  extras: {
    type: [String],
    default: [], 
    validate: {
      validator: function (extras) {
        const validExtras = ['Desayuno','Cama extra', 'Cuna'];
        return extras.every(extra => validExtras.includes(extra));
      },
      message: 'Extras no válidos.',
    },
  },
}, {
  collection: 'Habitaciones',
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true },
});

const Habitacion = mongoose.model('Habitacion', HabitacionSchema);
module.exports = Habitacion;
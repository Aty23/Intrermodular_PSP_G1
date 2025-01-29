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
    default: 1, 
    min: 1,
    validate: {
      validator: function (num) {
        const capacidadMaxima = {
          'Sencilla': 1,
          'Doble': 2,
          'Triple': 3,
          'Suite': 4,
        };
        return num <= capacidadMaxima[this.tipoHabitacion];
      },
      message: props => `El número de personas (${props.value}) excede la capacidad de una habitación ${props.instance.tipoHabitacion}.`,
    },
  },
  estado: {
    type: String,
    enum: ['Disponible', 'Mantenimiento'],
    default: 'Disponible',
  },
  tamanyo: {  
    type: Number,
    required: true,
    min: [5, 'El tamaño mínimo permitido es 5m².'],
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede superar los 500 caracteres.'],
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
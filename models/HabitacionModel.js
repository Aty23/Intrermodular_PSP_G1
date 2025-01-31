const mongoose = require('mongoose');

const preciosPorTipo = {
  Sencilla: 30,
  Doble: 55,
  Triple: 75,
  Suite: 100
};

const HabitacionSchema = new mongoose.Schema({
  idHabitacion: {
    type: Number, 
    trim: true,
    required: true,
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
  servicios: {
    type: [String],
    default: [], 
    validate: {
      validator: function (extras) {
        const validExtras = ['MiniBar','', 'Cuna'];
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

HabitacionSchema.virtual('precio').get(function () {
  return preciosPorTipo[this.tipoHabitacion] || 0;
});

const Habitacion = mongoose.model('Habitacion', HabitacionSchema);
module.exports = Habitacion;
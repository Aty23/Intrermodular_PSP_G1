const mongoose = require('mongoose');

const HabitacionSchema = new mongoose.Schema({
  idHabitacion: {
    type: Number, 
    trim: true,
    required: true,
    unique: true
  },
  tipoHabitacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TipoHabitacion',
    required: true,
  },
  numPersonas: {
    type: Number,
    default: 1,
    min: 1,
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
}, {
  collection: 'Habitaciones',
  toJSON: { virtuals: true, versionKey: false}, 
  toObject: { virtuals: true, versionKey: false },
});

HabitacionSchema.virtual('precio').get(function () {
  return this.tipoHabitacion?.precioBase || 0;
});

const Habitacion = mongoose.model('Habitacion', HabitacionSchema);
module.exports = Habitacion;
const mongoose = require('mongoose');
const Counter = require('./CounterModel');

const ReservaSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true, 
  },
  idHabitacion: {
    type: Number, 
    trim: true,
    required: true,
  },
  cliente: {
    nombre: {
      type: String,
      trim: true,
      default: '', 
    },
    email: {
      type: String,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'El email debe ser válido'],
      default: '', 
    }
  },
  precio: {
    type: Number,
    trim: true,
    default: 0, 
    min: 0,
  },
  fechaInicio: {
    type: Date,
    trim: true,
  },
  fechaSalida: {
    type: Date,
    trim: true,
  },
  tipoHabitacion: {
    type: String,
    trim: true,
    default: '', 
  },
  numPersonas: {
    type: Number,
    trim: true,
    default: 0, 
  },
  extras: {
    type: Number,
    trim: true,
    default: 0, 
  },
}, {
  collection: 'Reservas',
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true },
});

ReservaSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { sequenceName: 'reservas' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true } 
    );

    this.id = counter.sequenceValue;
  }
  next();
});

const Reserva = mongoose.model('Reserva', ReservaSchema);
module.exports = Reserva;
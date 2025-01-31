const mongoose = require("mongoose");

const NotificacionSchema = new mongoose.Schema({
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  tipo: { type: String, default: "general" }, // Puede ser "reserva", "cancelación", etc.
},
{collection: "Notificaciones"});

const Notificacion = mongoose.model('Notificacion', NotificacionSchema);
module.exports = Notificacion;
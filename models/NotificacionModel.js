const mongoose = require("mongoose");

const NotificacionSchema = new mongoose.Schema({
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  tipo: { type: String, default: "general" },
  visto: { type: Boolean, default: false },
},
{collection: "Notificaciones"});

const Notificacion = mongoose.model('Notificacion', NotificacionSchema);
module.exports = Notificacion;
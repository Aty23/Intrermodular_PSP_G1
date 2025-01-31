const Notificacion = require("../models/NotificacionModel");

const getAllNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.find().sort({ fecha: -1 });
    res.status(200).json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las notificaciones" });
  }
};

module.exports = {
  getAllNotificaciones,
};

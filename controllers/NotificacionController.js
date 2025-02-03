const Notificacion = require("../models/NotificacionModel");

const getAllNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.find().sort({ fecha: -1 });
    res.status(200).json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las notificaciones" });
  }
};

// Obtener solo las no vistas
const getNotificacionesNoVistas = async (req, res) => {
  try {
    const notificacionesNoVistas = await Notificacion.find({ visto: false }).sort({ fecha: -1 });
    res.status(200).json(notificacionesNoVistas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las notificaciones no vistas" });
  }
};

  
  // Marcar notificaciones como vistas
  const marcarNotificacionesComoVistas = async (req, res) => {
    try {
      await Notificacion.updateMany({ visto: false }, { $set: { visto: true } });
      res.status(200).json({ message: "Notificaciones marcadas como vistas" });
    } catch (error) {
      res.status(500).json({ error: "Error al marcar notificaciones como vistas" });
    }
  };

  module.exports = {
    getAllNotificaciones,
    getNotificacionesNoVistas,
    marcarNotificacionesComoVistas,
  };

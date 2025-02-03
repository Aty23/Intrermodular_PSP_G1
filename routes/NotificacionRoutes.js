const express = require("express");
const { getAllNotificaciones, getNotificacionesNoVistas, marcarNotificacionesComoVistas } = require("../controllers/NotificacionController");

const router = express.Router();

// Obtener todas las notificaciones
router.get("/getAll", getAllNotificaciones);

// Obtener solo las no vistas
router.get("/getNoVistas", getNotificacionesNoVistas);

// Marcar notificaciones como vistas
router.post("/marcarVistas", marcarNotificacionesComoVistas);

module.exports = router;

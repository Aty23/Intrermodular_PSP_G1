const express = require("express");
const { getAllNotificaciones } = require("../controllers/NotificacionController");

const router = express.Router();

// Ruta para obtener todas las notificaciones
router.get("/getAll", getAllNotificaciones);

module.exports = router;

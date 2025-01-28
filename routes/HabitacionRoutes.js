const express = require('express');
const multer = require('multer');
const path = require('path');
const { createHabitacion, getAllHabitaciones, deleteHabitacion } = require('../controllers/HabitacionController');

const router = express.Router();

// Rutas
router.get('/getAll', getAllHabitaciones);
router.post('/create', createHabitacion);
router.post('/delete', deleteHabitacion);

module.exports = router;

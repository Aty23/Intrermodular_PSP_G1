const express = require('express');
const path = require('path');
const { createHabitacion, getAllHabitaciones, updateHabitacion, filterHabitaciones, deleteHabitacion } = require('../controllers/HabitacionController');

const router = express.Router();

// Rutas
router.post('/create', createHabitacion);
router.get('/getAll', getAllHabitaciones);
router.patch('/update', updateHabitacion);
router.post('/filter', filterHabitaciones);
router.post('/delete', deleteHabitacion);

module.exports = router;

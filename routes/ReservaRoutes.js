const express = require('express');
const { getAllReservas, createReserva, deleteReserva, getFilter, updateReserva, getPrimerasHabitacionesDisponibles } = require('../controllers/ReservaController');
const router = express.Router();

router.get('/getAll', getAllReservas)
router.post('/create', createReserva);
router.post('/delete', deleteReserva);
router.post('/filter', getFilter);
router.patch('/update', updateReserva);
router.post('/getPrimerasHabitaciones', getPrimerasHabitacionesDisponibles);

module.exports = router;
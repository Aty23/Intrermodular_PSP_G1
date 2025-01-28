const express = require('express');
const { getAllReservas, createReserva, deleteReserva } = require('../controllers/ReservaController');
const router = express.Router();

router.get('/getAll', getAllReservas)
router.post('/create', createReserva);
router.post('/delete', deleteReserva);

module.exports = router;
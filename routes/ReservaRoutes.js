const express = require('express');
const { getAllReservas, createReserva, deleteReserva, getFilter } = require('../controllers/ReservaController');
const router = express.Router();

router.get('/getAll', getAllReservas)
router.post('/create', createReserva);
router.post('/delete', deleteReserva);
router.post('/filter', getFilter);
module.exports = router;
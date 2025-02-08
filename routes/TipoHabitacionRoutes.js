const express = require('express');
const {
  createTipoHabitacion,
  getAllTiposHabitacion,
  updateTipoHabitacion,
  deleteTipoHabitacion
} = require('../controllers/TipoHabitacionController');

const router = express.Router();

router.post('/create', createTipoHabitacion);
router.get('/getAll', getAllTiposHabitacion);
router.patch('/update', updateTipoHabitacion);
router.post('/delete', deleteTipoHabitacion);

module.exports = router;

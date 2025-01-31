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
router.put('/update', updateTipoHabitacion);
router.delete('/delete', deleteTipoHabitacion);

module.exports = router;

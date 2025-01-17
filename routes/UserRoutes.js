const express = require('express');
const router = express.Router();
const { createUser, getAllUsers } = require('../controllers/UserController');

// Rutas de usuario
router.post('/create', createUser); // Crear un usuario
router.get('/getAll', getAllUsers); // Obtener todos los usuarios

module.exports = router;
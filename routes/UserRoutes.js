const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUser,updateUser, deleteUser, checkUser } = require('../controllers/UserController');

//rutas
router.post('/create', createUser);
router.post('/login', checkUser)
router.get('/getAll', getAllUsers); 
router.get('/getOne/:email', getUser);
router.put('/update/:email', updateUser)
router.delete('/delete/:email', deleteUser)

module.exports = router;
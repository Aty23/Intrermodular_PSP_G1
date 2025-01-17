const User = require('../models/UserModel');

// Crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    //Crear el usuario que luego se guarda
    const newUser = new User({
      name: name || '', 
      email,
      password,
      role: role || 'usuario', 
      phone: phone || '', 
      address: address || '', 
    });

    // Guardar en la base de datos
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
};

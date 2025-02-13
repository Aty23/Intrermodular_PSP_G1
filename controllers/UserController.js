const User = require('../models/UserModel');
const jwt = require("jsonwebtoken");
require("dotenv").config();

//create
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    //esquema para el usuario que se va a enviar
    const newUser = new User({
      name: name || '', 
      email,
      password,
      role: role || 'usuario', 
      phone: phone || '', 
      address: address || '', 
    });

    //guardar en la base de datos
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

//check user
const checkUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

//get one
const getUser = async (req, res) => {
  try {
    const email = req.params.email
    console.log('Email recibido:', email); ; 
    const user = await User.findOne({ email: email }); 
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario', error: error.message });
  }
};
//get all
const getAllUsers = async (req, res) =>{
  try{
    const users = await User.find();
    res.status(200).json(users);
  }catch(error) {
    res.status(500).json({error: "Error al obtener los usuarios"})
  }
}
//update
const updateUser = async (req, res) => {
  try {
    const email = req.params.email
    console.log('Email recibido:', email); ; 
    const user = await User.findOne({ email: email }); 
    const updates = req.body;    
    const updatedUser = await User.findByIdAndUpdate(user, updates, {
      new: true, 
      runValidators: true, 
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};
//delete
const deleteUser = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await User.deleteOne({ email: email });

    res.status(200).json({ message: 'Usuario eliminado correctamente', user: user });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

module.exports = {
  createUser,
  checkUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};

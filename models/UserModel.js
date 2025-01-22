const mongoose = require('mongoose');

//modelo de usuario (este no tiene mucho misterio la vd)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: '', 
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, ingrese un correo válido',
    ],
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  role: {
    type: String,
    enum: ['usuario', 'trabajador', 'admin'],
    default: 'usuario',
  },
  phone: {
    type: String,
    match: [
      /^\+\d{2}\s\d{9}$/,
      'El teléfono debe tener el formato: +55 555555555',
    ],
    default: '', 
  },
  address: {
    type: String,
    default: '', 
  },
}, {
  collection: 'Usuarios',
});


const User = mongoose.model('User', UserSchema);
module.exports = User;

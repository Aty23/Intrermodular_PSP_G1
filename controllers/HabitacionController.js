const Habitacion = require("../models/HabitacionModel");
const fs = require('fs');
const path = require('path');

// Crear una nueva habitación
const createHabitacion = async (req, res) => {
  try {
    const { idHabitacion, precio, tipoHabitacion, numPersonas, estado, tamanyo, descripcion, extras, imagenes } = req.body;


    const nuevaHabitacion = new Habitacion({
      idHabitacion,  
      precio,
      tipoHabitacion,
      numPersonas,
      estado,
      tamanyo,
      descripcion,
      extras: extras || [],
      imagenes: imagenes || [],
    });

    await nuevaHabitacion.save();
    res.status(201).json({
      message: "Habitación creada con éxito",
      habitacion: nuevaHabitacion,
    });
  } catch (error) {
    res.status(400).json({ error: `Error al crear la habitación: ${error.message}` });
  }
};

// Obtener todas las habitaciones
const getAllHabitaciones = async (req, res) => {
  try {
    const habitaciones = await Habitacion.find();
    res.status(200).json(habitaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las habitaciones" });
  }
};

// Eliminar una habitación por ID
const deleteHabitacion = async (req, res) => {
  try {
    const { idHabitacion } = req.body;

    if (!idHabitacion) {
      return res.status(400).json({ message: "El campo idHabitacion es obligatorio." });
    }

    const habitacion = await Habitacion.findOneAndDelete({ idHabitacion });

    if (!habitacion) {
      return res.status(404).json({ message: "Habitación no encontrada." });
    }

    res.status(200).json({
      message: "Habitación eliminada correctamente.",
      habitacion,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar la habitación: ${error.message}` });
  }
};

module.exports = {
  createHabitacion,
  getAllHabitaciones,
  deleteHabitacion,
};

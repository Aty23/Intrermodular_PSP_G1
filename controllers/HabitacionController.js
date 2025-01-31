const Habitacion = require("../models/HabitacionModel");
const TipoHabitacion = require("../models/TipoHabitacionModel");
const fs = require('fs');
const path = require('path');

// Crear una nueva habitación
const createHabitacion = async (req, res) => {
  try {
    const { idHabitacion, tipoHabitacion, numPersonas, estado, tamanyo, descripcion, imagenes } = req.body;

    const tipo = await TipoHabitacion.findOne({ nombre: tipoHabitacion });

    if (!tipo) {
      return res.status(400).json({ message: "El tipo de habitación no existe." });
    }

    const nuevaHabitacion = new Habitacion({
      idHabitacion,
      tipoHabitacion: tipo._id,
      numPersonas,
      estado,
      tamanyo,
      descripcion,
      imagenes: imagenes || [],
    });

    await nuevaHabitacion.save();
    res.status(201).json({
      message: "Habitación creada con éxito",
      habitacion: {
        idHabitacion: nuevaHabitacion.idHabitacion,
        tipoHabitacion: tipo.nombre, // Se devuelve el nombre en lugar del ID
        numPersonas: nuevaHabitacion.numPersonas,
        estado: nuevaHabitacion.estado,
        tamanyo: nuevaHabitacion.tamanyo,
        descripcion: nuevaHabitacion.descripcion,
        imagenes: nuevaHabitacion.imagenes,
        precio: tipo.precioBase
      }
    });
  } catch (error) {
    res.status(400).json({ error: `Error al crear la habitación: ${error.message}` });
  }
};

// Obtener todas las habitaciones
const getAllHabitaciones = async (req, res) => {
  try {
    const habitaciones = await Habitacion.find().populate("tipoHabitacion");

    // Convertir el resultado para devolver el nombre en lugar del _id
    const habitacionesConTipo = habitaciones.map(habitacion => ({
      idHabitacion: habitacion.idHabitacion,
      tipoHabitacion: habitacion.tipoHabitacion.nombre,
      numPersonas: habitacion.numPersonas,
      estado: habitacion.estado,
      tamanyo: habitacion.tamanyo,
      descripcion: habitacion.descripcion,
      imagenes: habitacion.imagenes.map(img => `/images/${path.basename(img)}`),
      precio: habitacion.tipoHabitacion.precioBase
    }));

    res.status(200).json(habitacionesConTipo);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ error: "Error al obtener las habitaciones" });
  }
};

// Eliminar una habitación por ID
const deleteHabitacion = async (req, res) => {
  try {
    const { idHabitacion } = req.body;

    if (!idHabitacion || isNaN(idHabitacion)) {
      return res.status(400).json({ message: "El campo idHabitacion es obligatorio." });
    }

    const habitacion = await Habitacion.findOne({ idHabitacion }).populate("tipoHabitacion");

    if (!habitacion) {
      return res.status(404).json({ message: "Habitación no encontrada." });
    }

    // Eliminar la habitación de la base de datos
    await Habitacion.findOneAndDelete({ idHabitacion });

    res.status(200).json({
      message: "Habitación eliminada correctamente.",
      habitacion: {
        idHabitacion: habitacion.idHabitacion,
        tipoHabitacion: habitacion.tipoHabitacion.nombre,
        numPersonas: habitacion.numPersonas,
        estado: habitacion.estado,
        tamanyo: habitacion.tamanyo,
        descripcion: habitacion.descripcion,
        imagenes: habitacion.imagenes
      }
    });
  } catch (error) {
    console.error("Error al eliminar la habitación:", error);
    res.status(500).json({ error: `Error al eliminar la habitación: ${error.message}` });
  }
};

module.exports = {
  createHabitacion,
  getAllHabitaciones,
  deleteHabitacion,
};

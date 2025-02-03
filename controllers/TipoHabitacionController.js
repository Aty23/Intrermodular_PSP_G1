const TipoHabitacion = require('../models/TipoHabitacionModel');

// Crear un nuevo tipo de habitación
const createTipoHabitacion = async (req, res) => {
  try {
    const { nombre, precioBase, capacidadMaxima, servicios } = req.body;

    const nuevoTipo = new TipoHabitacion({
      nombre,
      precioBase,
      capacidadMaxima,
      servicios: servicios || []
    });

    await nuevoTipo.save();
    res.status(201).json({ message: "Tipo de habitación creado con éxito", tipo: nuevoTipo });
  } catch (error) {
    res.status(400).json({ error: `Error al crear el tipo de habitación: ${error.message}` });
  }
};

// Obtener todos los tipos de habitación
const getAllTiposHabitacion = async (req, res) => {
  try {
    const tipos = await TipoHabitacion.find();
    res.status(200).json(tipos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los tipos de habitación" });
  }
};

// Actualizar un tipo de habitación
const updateTipoHabitacion = async (req, res) => {
  try {
    const { id, nombre, precioBase, capacidadMaxima, servicios } = req.body;

    if (!nombre || !precioBase || isNaN(precioBase) || precioBase < 0) {
      return res.status(400).json({ message: "Se requiere un nombre válido y un precio positivo." });
    }

    const tipo = await TipoHabitacion.findOneAndUpdate(
      {nombre},
      { precioBase, capacidadMaxima, servicios },
      { new: true }
    );

    if (!tipo) {
      return res.status(404).json({ message: "Tipo de habitación no encontrado" });
    }

    res.status(200).json({ message: "Tipo de habitación actualizado", tipo });
  } catch (error) {
    res.status(400).json({ error: `Error al actualizar el tipo de habitación: ${error.message}` });
  }
};

// Eliminar un tipo de habitación
const deleteTipoHabitacion = async (req, res) => {
  try {
    const { id } = req.body;

    const tipo = await TipoHabitacion.findByIdAndDelete(id);
    if (!tipo) {
      return res.status(404).json({ message: "Tipo de habitación no encontrado" });
    }

    res.status(200).json({ message: "Tipo de habitación eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el tipo de habitación" });
  }
};

module.exports = {
  createTipoHabitacion,
  getAllTiposHabitacion,
  updateTipoHabitacion,
  deleteTipoHabitacion
};

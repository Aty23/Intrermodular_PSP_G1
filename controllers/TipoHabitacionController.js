const TipoHabitacion = require('../models/TipoHabitacionModel');
const Habitacion = require('../models/HabitacionModel');

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

const getAllTiposHabitacion = async (req, res) => {
  try {
    const tipos = await TipoHabitacion.find();
    res.status(200).json(tipos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los tipos de habitación" });
  }
};

const updateTipoHabitacion = async (req, res) => {
  try {
    const { id, nombre, precioBase, capacidadMaxima, servicios } = req.body;

    if (!nombre || !precioBase || isNaN(precioBase) || precioBase < 0) {
      return res.status(400).json({ message: "Se requiere un nombre válido y un precio positivo." });
    }

    const tipoActual = await TipoHabitacion.findOne({ nombre });
    if (!tipoActual) {
      return res.status(404).json({ message: "Tipo de habitación no encontrado" });
    }

    if (capacidadMaxima < tipoActual.capacidadMaxima) {
      const habitacionesConMasPersonas = await Habitacion.find({
        tipoHabitacion: tipoActual._id,
        numPersonas: { $gt: capacidadMaxima }
      });

      if (habitacionesConMasPersonas.length > 0) {
        return res.status(400).json({
          message: `No se puede reducir la capacidad máxima a ${capacidadMaxima} porque hay ${habitacionesConMasPersonas.length} habitación(es) que exceden ese límite. Elimina o modifica esas habitaciones primero.`,
          habitaciones: habitacionesConMasPersonas.map(hab => ({
            idHabitacion: hab.idHabitacion,
            numPersonas: hab.numPersonas
          }))
        });
      }
    }

    const tipoActualizado = await TipoHabitacion.findOneAndUpdate(
      { nombre },
      { precioBase, capacidadMaxima, servicios },
      { new: true }
    );

    res.status(200).json({ message: "Tipo de habitación actualizado correctamente", tipo: tipoActualizado });

  } catch (error) {
    res.status(400).json({ error: `Error al actualizar el tipo de habitación: ${error.message}` });
  }
};

const deleteTipoHabitacion = async (req, res) => {
  try {
    const { nombre } = req.body;

    const tipo = await TipoHabitacion.findOne({nombre});
    if (!tipo) {
      return res.status(404).json({ message: "Tipo de habitación no encontrado." });
    }

    const habitacionesAsociadas = await Habitacion.find({ tipoHabitacion: tipo._id });

    if (habitacionesAsociadas.length > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el tipo de habitación '${tipo.nombre}' porque hay ${habitacionesAsociadas.length} habitaciones que dependen de él. 
        Debes eliminar o modificar esas habitaciones primero.`,
        habitaciones: habitacionesAsociadas.map(hab => ({
          idHabitacion: hab.idHabitacion,
          numPersonas: hab.numPersonas
        }))
      });
    }

    await TipoHabitacion.findByIdAndDelete(tipo._id);
    res.status(200).json({ message: "Tipo de habitación eliminado correctamente." });
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

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

const updateHabitacion = async (req, res) => {
  try {
    const { idHabitacion, tipoHabitacion, numPersonas, estado, tamanyo, descripcion, imagenes } = req.body;

    if (!idHabitacion) {
      return res.status(400).json({ message: "El campo idHabitacion es obligatorio." });
    }

    let updateFields = {};

    // Buscar la habitación antes de actualizar para obtener su tipo actual
    let habitacionExistente = await Habitacion.findOne({ idHabitacion }).populate("tipoHabitacion");
    if (!habitacionExistente) {
      return res.status(404).json({ message: "Habitación no encontrada." });
    }

    let tipoHabitacionActual = habitacionExistente.tipoHabitacion;
    if (tipoHabitacion) {
      // Si se cambia el tipo de habitación, obtenemos el nuevo tipo
      const nuevoTipo = await TipoHabitacion.findOne({ nombre: tipoHabitacion });
      if (!nuevoTipo) {
        return res.status(400).json({ message: "El tipo de habitación no existe." });
      }
      tipoHabitacionActual = nuevoTipo; // Actualizamos el tipo para la validación
      updateFields.tipoHabitacion = nuevoTipo._id;
    }

    // Validar `numPersonas` contra `capacidadMaxima`
    if (numPersonas !== undefined) {
      if (numPersonas > tipoHabitacionActual.capacidadMaxima) {
        return res.status(400).json({
          message: `El número de personas (${numPersonas}) excede la capacidad máxima de una habitación ${tipoHabitacionActual.nombre} (${tipoHabitacionActual.capacidadMaxima}).`
        });
      }
      updateFields.numPersonas = numPersonas;
    }

    if (estado) updateFields.estado = estado;
    if (tamanyo !== undefined) updateFields.tamanyo = tamanyo;
    if (descripcion) updateFields.descripcion = descripcion;
    if (imagenes) updateFields.imagenes = imagenes.map(img => `/images/${path.basename(img)}`);

    // Actualizar la habitación
    const habitacionActualizada = await Habitacion.findOneAndUpdate(
      { idHabitacion },
      { $set: updateFields },
      { new: true }
    ).populate("tipoHabitacion");

    res.status(200).json({
      message: "Habitación actualizada correctamente.",
      habitacion: {
        idHabitacion: habitacionActualizada.idHabitacion,
        tipoHabitacion: habitacionActualizada.tipoHabitacion.nombre,
        numPersonas: habitacionActualizada.numPersonas,
        estado: habitacionActualizada.estado,
        tamanyo: habitacionActualizada.tamanyo,
        descripcion: habitacionActualizada.descripcion,
        imagenes: habitacionActualizada.imagenes,
        precio: habitacionActualizada.tipoHabitacion.precioBase
      }
    });

  } catch (error) {
    console.error("Error al actualizar la habitación:", error);
    res.status(500).json({ error: `Error al actualizar la habitación: ${error.message}` });
  }
};

const filterHabitaciones = async (req, res) => {
  try {
    const { idHabitacion, tipoHabitacion, numPersonasMax, estado, tamanyoMax, precioMax } = req.body;

    let filtros = {};

    if (idHabitacion) filtros.idHabitacion = idHabitacion;
    if (estado) filtros.estado = estado;
    if (tamanyoMax) filtros.tamanyo = { $lte: tamanyoMax };
    if (numPersonasMax) filtros.numPersonas = { $lte: numPersonasMax };

    // Si se filtra por tipo de habitación, primero obtenemos su `_id`
    if (tipoHabitacion) {
      const tipo = await TipoHabitacion.findOne({ nombre: tipoHabitacion });
      if (!tipo) {
        return res.status(400).json({ message: "El tipo de habitación no existe." });
      }
      filtros.tipoHabitacion = tipo._id;
    }

    // Buscar habitaciones con los filtros
    const habitaciones = await Habitacion.find(filtros).populate("tipoHabitacion");

    // Aplicar el filtro de precio después de obtener los datos
    const habitacionesFiltradas = habitaciones
      .map(habitacion => ({
        idHabitacion: habitacion.idHabitacion,
        tipoHabitacion: habitacion.tipoHabitacion.nombre,
        numPersonas: habitacion.numPersonas,
        estado: habitacion.estado,
        tamanyo: habitacion.tamanyo,
        descripcion: habitacion.descripcion,
        imagenes: habitacion.imagenes.map(img => `/images/${path.basename(img)}`),
        precio: habitacion.tipoHabitacion.precioBase
      }))
      .filter(habitacion => !precioMax || habitacion.precio <= precioMax);

    res.status(200).json(habitacionesFiltradas);

  } catch (error) {
    console.error("Error al filtrar habitaciones:", error);
    res.status(500).json({ error: "Error al filtrar las habitaciones" });
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
  updateHabitacion,
  filterHabitaciones,
  deleteHabitacion,
};

const Habitacion = require("../models/HabitacionModel");
const TipoHabitacion = require("../models/TipoHabitacionModel");
const Notificacion = require("../models/NotificacionModel");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Crear una nueva habitación
const createHabitacion = async (req, res) => {
  try {
    const { idHabitacion, tipoHabitacion, numPersonas, estado, tamanyo, descripcion, imagenes } = req.body;

    const tipo = await TipoHabitacion.findOne({ nombre: tipoHabitacion });

    if (!tipo) {
      return res.status(400).json({ message: "El tipo de habitación no existe." });
    }

    if (numPersonas > tipo.capacidadMaxima) {
      return res.status(400).json({
        error: `El número de personas (${numPersonas}) excede la capacidad máxima de una habitación ${tipo.nombre} (${tipo.capacidadMaxima}).`
      });
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
    
    const nuevaNotificacion = new Notificacion({
      mensaje: `Creada habitación con ID: ${nuevaHabitacion.idHabitacion}`,
      fecha: new Date(),
      tipo: "habitacion", 
    });

    await nuevaNotificacion.save();

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

// Obtener todas las habitaciones (sin uso)
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
          error: `El número de personas (${numPersonas}) excede la capacidad máxima de una habitación ${tipoHabitacionActual.nombre} (${tipoHabitacionActual.capacidadMaxima}).`
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

    const nuevaNotificacion = new Notificacion({
      mensaje: `Actualizada habitación con ID: ${idHabitacion}`,
      fecha: new Date(),
      tipo: "habitacion", 
    });

    await nuevaNotificacion.save();

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
    const { 
      idHabitacion, tipoHabitacion, numPersonasMin, numPersonasMax, 
      estado, tamanyoMin, tamanyoMax, precioMin, precioMax 
    } = req.body;

    let filtros = {};

    if (idHabitacion) filtros.idHabitacion = idHabitacion;
    if (estado) filtros.estado = estado;

    // Validar tamaño mínimo/máximo
    if (tamanyoMin && tamanyoMax && tamanyoMin > tamanyoMax) {
      return res.status(400).json({ message: "El tamaño mínimo no puede ser mayor que el tamaño máximo." });
    }
    if (tamanyoMin) filtros.tamanyo = { $gte: tamanyoMin };
    if (tamanyoMax) filtros.tamanyo = { ...filtros.tamanyo, $lte: tamanyoMax };

    // Validar aforo mínimo/máximo
    if (numPersonasMin && numPersonasMax && numPersonasMin > numPersonasMax) {
      return res.status(400).json({ message: "El aforo mínimo no puede ser mayor que el aforo máximo." });
    }
    if (numPersonasMin) filtros.numPersonas = { $gte: numPersonasMin };
    if (numPersonasMax) filtros.numPersonas = { ...filtros.numPersonas, $lte: numPersonasMax };

    // Si se filtra por tipo de habitación, primero obtenemos su `_id`
    if (tipoHabitacion) {
      const tipo = await TipoHabitacion.findOne({ nombre: tipoHabitacion });
      if (!tipo) {
        return res.status(400).json({ message: "El tipo de habitación no existe." });
      }
      filtros.tipoHabitacion = tipo._id;
    }

    // Buscar habitaciones con los filtros
    let habitaciones = await Habitacion.find(filtros).populate("tipoHabitacion");

    // Aplicar el filtro de precio dentro de la consulta
    habitaciones = habitaciones.filter(habitacion => {
      const precio = habitacion.tipoHabitacion.precioBase;
      return (!precioMin || precio >= precioMin) && (!precioMax || precio <= precioMax);
    });

    // Mapear los resultados para devolverlos correctamente
    const habitacionesFiltradas = habitaciones.map(habitacion => ({
      idHabitacion: habitacion.idHabitacion,
      tipoHabitacion: habitacion.tipoHabitacion.nombre,
      numPersonas: habitacion.numPersonas,
      estado: habitacion.estado,
      tamanyo: habitacion.tamanyo,
      descripcion: habitacion.descripcion,
      imagenes: habitacion.imagenes.map(img => `/images/${path.basename(img)}`),
      precio: habitacion.tipoHabitacion.precioBase
    }));

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

    await Habitacion.findOneAndDelete({ idHabitacion });

    const nuevaNotificacion = new Notificacion({
      mensaje: `Eliminada habitación con ID: ${idHabitacion}`,
      fecha: new Date(),
      tipo: "habitacion", 
    });

    await nuevaNotificacion.save();

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

// Configurar almacenamiento para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/images");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// ENDPOINT para subir imágenes
const uploadImage = async (req, res) => {
  try {
    const { idHabitacion } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "No se ha enviado ninguna imagen." });
    }

    const habitacion = await Habitacion.findOne({ idHabitacion });
    if (!habitacion) {
      return res.status(404).json({ message: "Habitación no encontrada." });
    }

    // Guardamos la imagen y la asociamos a la habitación
    const imageUrl = `/images/${req.file.filename}`;
    habitacion.imagenes.push(imageUrl);
    await habitacion.save();

    res.status(200).json({ message: "Imagen subida con éxito.", imageUrl });
  } catch (error) {
    res.status(500).json({ error: `Error al subir la imagen: ${error.message}` });
  }
};

const uploadMainImage = async (req, res) => {
  try {
    const { idHabitacion } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "No se ha enviado ninguna imagen." });
    }

    const habitacion = await Habitacion.findOne({ idHabitacion });
    if (!habitacion) {
      return res.status(404).json({ message: "Habitación no encontrada." });
    }

    // Guardamos la imagen y la asociamos a la habitación
    const imageUrl = `/images/${req.file.filename}`;
    habitacion.imagenes.unshift(imageUrl);
    await habitacion.save();

    res.status(200).json({ message: "Imagen subida con éxito.", imageUrl });
  } catch (error) {
    res.status(500).json({ error: `Error al subir la imagen: ${error.message}` });
  }
};

const deleteAllImages = async (req, res) => {
  try {
    const { idHabitacion } = req.params;

    const habitacion = await Habitacion.findOne({ idHabitacion });
    if (!habitacion) {
      return res.status(404).json({ message: "Habitación no encontrada." });
    }

    // Eliminar las imágenes del array
    habitacion.imagenes = [];
    await habitacion.save();

    res.status(200).json({ message: "Todas las imágenes de la habitación han sido eliminadas." });
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar imágenes: ${error.message}` });
  }
};

module.exports = {
  createHabitacion,
  getAllHabitaciones,
  updateHabitacion,
  filterHabitaciones,
  deleteHabitacion,
  uploadImage,
  uploadMainImage,
  deleteAllImages
};

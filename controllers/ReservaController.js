const Reserva = require("../models/ReservaModel");

//create
const createReserva = async (req, res) => {
  try {
    const {
      idHabitacion,
      cliente,
      precio,
      fechaInicio,
      fechaSalida,
      tipoHabitacion,
      numPersonas,
      extras,
    } = req.body;

    if (!idHabitacion || !fechaInicio || !fechaSalida) {
      return res.status(400).json({
        message: "Los campos idHabitacion, fechaInicio y fechaSalida son obligatorios",
      });
    }

    const newReserva = new Reserva({
      idHabitacion, 
      cliente: {
        nombre: cliente?.nombre || "Sin nombre",
        email: cliente?.email || "Sin email",
      },
      precio: precio || 0,
      fechaInicio,
      fechaSalida,
      tipoHabitacion: tipoHabitacion || "Sin especificar",
      numPersonas: numPersonas || 1,
      extras: extras || 0,
    });

    await newReserva.save();

    res.status(201).json({
      message: "Reserva creada con éxito",
      reserva: newReserva,
    });
  } catch (error) {
    res.status(400).json({ error: `Error al crear la reserva: ${error.message}` });
  }
};


//get all
const getAllReservas = async (req, res) => {
  try {
    const reserva = await Reserva.find();
    res.status(200).json(reserva);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las reservas" });
  }
};

//delete
const deleteReserva = async (req, res) => {
  try {
      const { id } = req.body;

      if (!id) {
          return res.status(400).json({ message: "Se requiere el id de la reserva para eliminarla." });
      }

      const reserva = await Reserva.findOneAndDelete({ id: Number(id) });

      if (!reserva) {
          return res.status(404).json({ message: "Reserva no encontrada." });
      }

      res.status(200).json({ message: "Reserva eliminada correctamente.", reserva });
  } catch (error) {
      res.status(500).json({ message: "Error al eliminar la reserva.", error: error.message });
  }
};

//getFilter
const getFilter = async (req, res) => {
  const filters = req.body;

  // Construir los filtros dinámicamente
  const query = {};
  if (filters.id) query.id = filters.id;
  if (filters.idHabitacion) query.idHabitacion = filters.idHabitacion;
  if (filters["cliente.email"]) query["cliente.email"] = filters["cliente.email"];
  if (filters.numPersonas) query.numPersonas = filters.numPersonas;
  if (filters.fechaInicio) query.fechaInicio = new Date(filters.fechaInicio);
  if (filters.fechaSalida) query.fechaSalida = new Date(filters.fechaSalida);
  if (filters.tipoHabitacion) query.tipoHabitacion = filters.tipoHabitacion;

  console.log("Consulta generada:", query);

  try {
    const reservas = await Reserva.find(query);
    if (!reservas.length) {
      return res.status(404).json({ message: "No se encontraron reservas con los filtros proporcionados." });
    }

    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({ error: "Error al filtrar reservas: " + error.message });
  }
};


module.exports = {
  createReserva,
  getAllReservas,
  deleteReserva,
  getFilter,
};

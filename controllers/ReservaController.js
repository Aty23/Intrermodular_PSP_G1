const Reserva = require("../models/ReservaModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  secure: false, 
  auth: {
    user: "90ee211aa33335b62dda29df50bfb1ab",  
    pass: "463687e50af2a69a09cdf288bb8a298f" 
  }
});

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

    if (cliente?.email) {
      const mailOptions = {
        from: "intermodularg1@gmail.com", 
        to: cliente.email,
        subject: "Confirmación de Reserva 🏨 - Hotel Pere Maria",
        html: `
          <h2>¡Tu reserva está confirmada! ✅</h2>
          <p>Hola <strong>${cliente.nombre || "Cliente"}</strong>,</p>
          <p>Tu reserva ha sido creada exitosamente.</p>
          <ul>
            <li><strong>Habitación:</strong> ${idHabitacion}</li>
            <li><strong>Tipo:</strong> ${tipoHabitacion || "No especificado"}</li>
            <li><strong>Fecha de entrada:</strong> ${new Date(fechaInicio).toLocaleDateString()}</li>
            <li><strong>Fecha de salida:</strong> ${new Date(fechaSalida).toLocaleDateString()}</li>
            <li><strong>Número de personas:</strong> ${numPersonas}</li>
            <li><strong>Extras:</strong> ${extras}</li>
            <li><strong>Precio:</strong> $${precio}</li>
          </ul>
          <p>¡Gracias por confiar en nosotros! 🏨✨</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Correo enviado correctamente a", cliente.email);
    }

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

// updateReserva
const updateReserva = async (req, res) => {
  try {
    const { id, idHabitacion, cliente, precio, fechaInicio, fechaSalida, tipoHabitacion, numPersonas, extras } = req.body;

    if (!id) {
      return res.status(400).json({ message: "El ID de la reserva es obligatorio para la actualización." });
    }

    const reservaActualizada = await Reserva.findOneAndUpdate(
      { id: id },
      {
        idHabitacion,
        cliente: {
          nombre: cliente?.nombre || "Sin nombre",
          email: cliente?.email || "Sin email",
        },
        precio,
        fechaInicio,
        fechaSalida,
        tipoHabitacion,
        numPersonas,
        extras,
      },
      { new: true } 
    );

    if (!reservaActualizada) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    res.status(200).json({ message: "Reserva actualizada correctamente.", reserva: reservaActualizada });
  } catch (error) {
    res.status(500).json({ error: `Error al actualizar la reserva: ${error.message}` });
  }
};

module.exports = {
  createReserva,
  getAllReservas,
  deleteReserva,
  getFilter,
  updateReserva,
};

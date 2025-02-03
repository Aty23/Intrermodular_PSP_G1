const Reserva = require("../models/ReservaModel");
const nodemailer = require("nodemailer");
const Notificacion = require("../models/NotificacionModel");

const transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  secure: false,
  auth: {
    user: "90ee211aa33335b62dda29df50bfb1ab",
    pass: "463687e50af2a69a09cdf288bb8a298f",
  },
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
        message:
          "Los campos idHabitacion, fechaInicio y fechaSalida son obligatorios",
      });
    }

    const fechaInicioUTC = new Date(req.body.fechaInicio);
    const fechaSalidaUTC = new Date(req.body.fechaSalida);

    // Corregir la fecha sumando un día
    fechaInicioUTC.setDate(fechaInicioUTC.getDate() + 1);
    fechaSalidaUTC.setDate(fechaSalidaUTC.getDate() + 1);

    const newReserva = new Reserva({
      idHabitacion,
      cliente: {
        nombre: cliente?.nombre || "Sin nombre",
        email: cliente?.email || "Sin email",
      },
      precio: precio || 0,
      fechaInicio: fechaInicioUTC,
      fechaSalida: fechaSalidaUTC,
      tipoHabitacion: tipoHabitacion || "Sin especificar",
      numPersonas: numPersonas || 1,
      extras: extras || 0,
    });

    await newReserva.save();

    const nuevaNotificacion = new Notificacion({
      mensaje: `Creada reserva con ID: ${newReserva.id}`,
      fecha: new Date(),
      tipo: "reserva", // Puedes categorizarlo si quieres
    });

    await nuevaNotificacion.save();

    /*if (cliente?.email) {
      const mailOptions = {
        from: "intermodularg1@gmail.com", 
        to: cliente.email,
        subject: "Confirmación de Reserva 🏨 - Hotel Pere Maria",
        html: `
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <!-- Columna izquierda: Texto -->
    <td width="50%" style="padding: 20px; vertical-align: top;">
      <h2 style="font-family: Arial, sans-serif; 
           font-size: 28px; 
           font-weight: bold; 
           color: #248195; 
           margin: 0; 
           padding-bottom: 10px;">
  ¡Tu reserva está confirmada!
</h2>
      <p>Hola <strong>${cliente.nombre || "Cliente"}</strong>,</p>
      <p>Tu reserva ha sido creada exitosamente.</p>
      <ul>
        <li><strong>Habitación:</strong> ${idHabitacion}</li>
        <li><strong>Tipo:</strong> ${tipoHabitacion || "No especificado"}</li>
        <li><strong>Fecha de entrada:</strong> ${new Date(fechaInicio).toLocaleDateString()}</li>
        <li><strong>Fecha de salida:</strong> ${new Date(fechaSalida).toLocaleDateString()}</li>
        <li><strong>Número de personas:</strong> ${numPersonas}</li>
        <li><strong>Extras:</strong> ${extras}</li>
        <li><strong>Precio:</strong> ${precio}€</li>
      </ul>
      <p>¡Gracias por confiar en nosotros! 🏨✨</p>
    </td>

    <!-- Columna derecha: Imagen 100% -->
    <td width="50%" style="padding: 0; margin: 0;">
      <img src="https://i.imgur.com/0NYwFWh.jpeg" 
           alt="Habitación del Hotel" 
           style="width: 100%; height: auto; display: block; border-radius: 0;">
    </td>
  </tr>
</table>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Correo enviado correctamente a", cliente.email);
    }*/

    res.status(201).json({
      message: "Reserva creada con éxito",
      reserva: newReserva,
      notificacion: nuevaNotificacion,
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: `Error al crear la reserva: ${error.message}` });
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
      return res
        .status(400)
        .json({ message: "Se requiere el id de la reserva para eliminarla." });
    }

    const reserva = await Reserva.findOneAndDelete({ id: Number(id) });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    res
      .status(200)
      .json({ message: "Reserva eliminada correctamente.", reserva });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar la reserva.", error: error.message });
  }
};

//getFilter
const getFilter = async (req, res) => {
  const filters = req.body;

  // Construir los filtros dinámicamente
  const query = {};
  if (filters.id) query.id = filters.id;
  if (filters.idHabitacion) query.idHabitacion = filters.idHabitacion;
  if (filters["cliente.email"])
    query["cliente.email"] = filters["cliente.email"];
  if (filters.numPersonas) query.numPersonas = filters.numPersonas;
  if (filters.fechaInicio) query.fechaInicio = new Date(filters.fechaInicio);
  if (filters.fechaSalida) query.fechaSalida = new Date(filters.fechaSalida);
  if (filters.tipoHabitacion) query.tipoHabitacion = filters.tipoHabitacion;

  console.log("Consulta generada:", query);

  try {
    const reservas = await Reserva.find(query);
    if (!reservas.length) {
      return res
        .status(404)
        .json({
          message: "No se encontraron reservas con los filtros proporcionados.",
        });
    }

    res.status(200).json(reservas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al filtrar reservas: " + error.message });
  }
};

// updateReserva
const updateReserva = async (req, res) => {
  try {
    const {
      id,
      idHabitacion,
      cliente,
      precio,
      fechaInicio,
      fechaSalida,
      tipoHabitacion,
      numPersonas,
      extras,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({
          message: "El ID de la reserva es obligatorio para la actualización.",
        });
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

    res
      .status(200)
      .json({
        message: "Reserva actualizada correctamente.",
        reserva: reservaActualizada,
      });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Error al actualizar la reserva: ${error.message}` });
  }
};

module.exports = {
  createReserva,
  getAllReservas,
  deleteReserva,
  getFilter,
  updateReserva,
};

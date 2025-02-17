const Reserva = require("../models/ReservaModel");
const nodemailer = require("nodemailer");
const Notificacion = require("../models/NotificacionModel");
const Habitacion = require("../models/HabitacionModel");
const path = require('path');
const dir = path.join(__dirname, "../public/images");

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
      fecha: new Date(new Date().setDate(new Date().getDate() + 1)),
      tipo: "reserva", 
    });

    await nuevaNotificacion.save();

    if (cliente?.email) {
      const mailOptions = {
        from: "intermodularg1@gmail.com",
        to: cliente.email,
        subject: "Confirmación de Reserva 🏨 - Hotel Pere Maria",
        html: `
          <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 20px; font-family: 'Poppins', Arial, sans-serif;">
  <tr>
    <td align="center">
      <table width="600px" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
        
        <tr>
          <td style="background: #278498; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; font-size: 24px; margin: 0;">¡Tu reserva está confirmada! 🎉</h2>
          </td>
        </tr>

        <tr>
          <td style="padding: 20px;">
            <p style="font-size: 16px; color: #333; margin: 0;">Hola <strong>${
              cliente.nombre || "Cliente"
            }</strong>,</p>
            <p style="font-size: 16px; color: #555; margin-top: 8px;">Tu reserva ha sido creada exitosamente.</p>

            <table width="100%" cellspacing="0" cellpadding="10" border="0" style="margin-top: 10px;">
              <tr>
                <td style="color: #278498;"><strong>Habitación:</strong></td>
                <td>${idHabitacion}</td>
              </tr>
              <tr>
                <td style="color: #278498;"><strong>Tipo:</strong></td>
                <td>${tipoHabitacion || "No especificado"}</td>
              </tr>
              <tr>
                <td style="color: #278498;"><strong>Fecha de entrada:</strong></td>
                <td>${new Date(fechaInicio).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="color: #278498;"><strong>Fecha de salida:</strong></td>
                <td>${new Date(fechaSalida).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="color: #278498;"><strong>Número de personas:</strong></td>
                <td>${numPersonas}</td>
              </tr>
              <tr>
                <td style="color: #278498;"><strong>Extras:</strong></td>
                <td>${extras}</td>
              </tr>
              <tr>
                <td style="color: #278498;"><strong>Precio:</strong></td>
                <td><strong>${precio}€</strong></td>
              </tr>
            </table>
            
            <p style="text-align: center; font-size: 14px; color: #666; margin-top: 15px;">¡Gracias por confiar en nosotros! 🏨✨</p>
          </td>
        </tr>

        <tr>
          <td>
            <img src="https://i.imgur.com/0NYwFWh.jpeg" alt="Habitación del Hotel" width="100%" style="border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; display: block;">
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Correo enviado correctamente a", cliente.email);
    }

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

    const nuevaNotificacion = new Notificacion({
      mensaje: `Reserva con ID: ${id} eliminada.`,
      fecha: new Date(),
      tipo: "reserva",
    });

    await nuevaNotificacion.save();

    res
      .status(200)
      .json({
        message: "Reserva eliminada correctamente.",
        reserva,
        notificacion: nuevaNotificacion,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar la reserva.", error: error.message });
  }
};

//getFilter
const getFilter = async (req, res) => {
  const filters = req.body;
  const query = {};

  if (filters.id) query.id = filters.id;
  if (filters.idHabitacion) query.idHabitacion = filters.idHabitacion;
  if (filters["cliente.email"])
    query["cliente.email"] = filters["cliente.email"];
  if (filters.numPersonas) query.numPersonas = filters.numPersonas;
  if (filters.tipoHabitacion) query.tipoHabitacion = filters.tipoHabitacion;

  if (filters.fechaInicio && filters.fechaSalida) {
    const fechaInicio = new Date(filters.fechaInicio);
    const fechaSalida = new Date(filters.fechaSalida);

    query.$or = [
      { fechaInicio: { $gte: fechaInicio, $lte: fechaSalida } },
      { fechaSalida: { $gte: fechaInicio, $lte: fechaSalida } },
      {
        fechaInicio: { $lte: fechaInicio },
        fechaSalida: { $gte: fechaSalida },
      },
    ];
  }

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
    console.log("Datos recibidos para actualizar:", req.body);

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
      return res.status(400).json({
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

    const nuevaNotificacion = new Notificacion({
      mensaje: `Reserva con ID: ${id} actualizada.`,
      fecha: new Date(),
      tipo: "reserva",
    });

    await nuevaNotificacion.save();

    res.status(200).json({
      message: "Reserva actualizada correctamente.",
      reserva: reservaActualizada,
      notificacion: nuevaNotificacion,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Error al actualizar la reserva: ${error.message}` });
  }
};

// getPrimerasHabitacionesDisponibles
const getPrimerasHabitacionesDisponibles = async (req, res) => {
  try {
    const { fechaInicio, fechaSalida, numPersonas, extraCama } = req.body;
    console.log("Se ha realizado una consulta: ",req.body);

    const numPersonasInt = parseInt(numPersonas, 10) || 1; 
    const extraCamaBool = extraCama === 'true'; 

    if (!fechaInicio || !fechaSalida || !numPersonas) {
      return res.status(400).json({
        message: "Los campos fechaInicio, fechaSalida y numPersonas son obligatorios.",
      });
    }

    const entrada = new Date(fechaInicio);
    const salida = new Date(fechaSalida);

    if (entrada >= salida) {
      return res.status(400).json({
        message: "La fecha de salida debe ser posterior a la fecha de entrada.",
      });
    }

    const habitaciones = await Habitacion.find({ estado: "Disponible" }).populate("tipoHabitacion");

    const reservas = await Reserva.find({
      $or: [{ fechaInicio: { $lt: salida }, fechaSalida: { $gt: entrada } }],
    });

    const habitacionesDisponibles = habitaciones.filter((habitacion) => {
      const capacidad = extraCamaBool ? habitacion.numPersonas + 1 : habitacion.numPersonas;
      if (capacidad < numPersonasInt) return false;

      const habitacionReservada = reservas.some(
        (reserva) => reserva.idHabitacion === habitacion.idHabitacion
      );
      return !habitacionReservada;
    });

    const habitacionesPorTipo = {};
    habitacionesDisponibles.forEach((habitacion) => {
      const tipo = habitacion.tipoHabitacion.nombre;
      if (!habitacionesPorTipo[tipo]) {
        habitacionesPorTipo[tipo] = habitacion;
      }
    });

    const resultado = Object.values(habitacionesPorTipo).map((habitacion) => ({
      idHabitacion: habitacion.idHabitacion,
      tipoHabitacion: habitacion.tipoHabitacion.nombre,
      numPersonas: habitacion.numPersonas,
      estado: habitacion.estado,
      tamanyo: habitacion.tamanyo,
      descripcion: habitacion.descripcion,
      imagenes: habitacion.imagenes.map(img => `/images/${path.basename(img)}`),
      precio: habitacion.tipoHabitacion.precioBase,
      servicios: habitacion.tipoHabitacion.servicios || [],
    }));
    console.log(resultado);

    if (resultado.length === 0) {
      return res.status(404).json({ message: "No hay habitaciones disponibles para estos criterios." });
    }

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: `Error al obtener habitaciones disponibles: ${error.message}` });
  }
};


module.exports = {
  createReserva,
  getAllReservas,
  deleteReserva,
  getFilter,
  updateReserva,
  getPrimerasHabitacionesDisponibles,
};

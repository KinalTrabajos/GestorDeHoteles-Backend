import { response } from "express";
import ReservationEvent from './reservationEvent.model.js'; 
import Event from "../EventsHotels/event.model.js";

// Crear una nueva reserva para un evento
export const addReservationEvent = async (req, res = response) => {
    try {
        const { id } = req.params; // ID del evento
        const { startDate, endDate } = req.body;
        const userId = req.usuario._id;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validación: no permitir traslape de reservas del mismo evento
        const conflict = await ReservationEvent.findOne({
            keeperEvent: id,
            state: true,
            $or: [
                { 'datesReservation.startDate': { $lte: end }, 'datesReservation.endDate': { $gte: start } }
            ]
        });

        if (conflict) {
            return res.status(409).json({ success: false, msg: 'Event already reserved for selected date range' });
        }

        const reservationevent = new ReservationEvent({
            keeperUser: userId,
            keeperEvent: id,
            datesReservation: { startDate: start, endDate: end },
            stateReservation: 'Pendiente',
            state: true
        });

        await reservationevent.save();

        return res.status(201).json({
            success: true,
            msg: 'Event reservation created successfully',
            reservationevent
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error creating event reservation',
            error: error.message
        });
    }
};

// Ver todas las reservas de eventos
export const viewEventReservations = async (req, res = response) => {
    const { limite = 100, desde = 0 } = req.query;
    try {
        const [reservations, total] = await Promise.all([
            ReservationEvent.find({ state: true })
                .populate({ path: 'keeperUser', select: 'username' })
                .populate({ path: 'keeperEvent', select: 'nameEvent typeEvent' })
                .skip(Number(desde))
                .limit(Number(limite)),
            ReservationEvent.countDocuments({ state: true })
        ]);

        return res.status(200).json({
            success: true,
            msg: 'Event reservations retrieved',
            total,
            reservations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error retrieving reservations',
            error: error.message
        });
    }
};

// Actualizar una reserva de evento
export const updateEventReservation = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;
        const userId = req.usuario._id;

        const reservationEvent = await ReservationEvent.findById(id);
        if (!reservationEvent) {
            return res.status(404).json({ success: false, msg: 'Reservation not found' });
        }

        const event = await Event.findById(reservationEvent.keeperEvent);
        if (!event) {
            return res.status(404).json({ success: false, msg: 'Associated event not found' });
        }

        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Validar traslape con otras reservas del mismo evento
        const conflict = await ReservationEvent.findOne({
            _id: { $ne: reservationEvent._id },
            keeperEvent: event._id,
            state: true,
            $or: [
                { 'datesReservation.startDate': { $lte: newEnd }, 'datesReservation.endDate': { $gte: newStart } }
            ]
        });

        if (conflict) {
            return res.status(409).json({ success: false, msg: 'Conflict with another reservation in selected range' });
        }

        reservationEvent.datesReservation.startDate = newStart;
        reservationEvent.datesReservation.endDate = newEnd;
        await reservationEvent.save();

        return res.status(200).json({
            success: true,
            msg: 'Reservation updated',
            reservationEvent
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error updating reservation',
            error: error.message
        });
    }
};

// Cancelar reserva de evento
export const cancelEventReservation = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { confirm } = req.body;

        const reservation = await ReservationEvent.findById(id);
        if (!reservation) {
            return res.status(404).json({ success: false, msg: 'Reservation not found' });
        }

        if (!confirm) {
            return res.status(200).json({
                success: true,
                msg: 'Please confirm cancellation with { "confirm": true }',
                reservation: {
                    id: reservation._id,
                    startDate: reservation.datesReservation.startDate,
                    endDate: reservation.datesReservation.endDate,
                    state: reservation.stateReservation
                }
            });
        }

        reservation.state = false;
        reservation.stateReservation = 'Cancelada';
        await reservation.save();

        return res.status(200).json({
            success: true,
            msg: 'Reservation cancelled successfully',
            reservation
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error cancelling reservation',
            error: error.message
        });
    }
};

export const confirmReservationEvent = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { ConfirmReservation } = req.body;
        
        if (!ConfirmReservation) {
            return res.status(400).json({
                success: false,
                msg: 'Please confirm reservation by resending with { "ConfirmReservation": true }'
            });
        }

        await ReservationEvent.findByIdAndUpdate(id, 
            {
                stateReservation: 'Confirmada',
                state: true
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            msg: 'Reservation confirmed',
            reservation: await ReservationEvent.findById(id)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error confirming reservation',
            error: error.message
        });
    }
};
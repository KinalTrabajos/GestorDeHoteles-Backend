import { response } from "express";
import Reservation from './reservation.model.js';
import Room from "../rooms/room.model.js";

export const addReservation = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;
        const userId = req.usuario._id;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ success: false, msg: 'Room not found' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validación: no permitir traslape de fechas en la misma habitación
        const conflict = await Reservation.findOne({
            keeperRoom: id,
            state: true,
            $or: [
                {
                    'datesReservation.startDate': { $lte: end },
                    'datesReservation.endDate': { $gte: start }
                }
            ]
        });

        if (conflict) {
            return res.status(409).json({ success: false, msg: 'Room already reserved for selected date range' });
        }

        const reservation = new Reservation({
            keeperUser: userId,
            keeperRoom: id,
            datesReservation: { startDate: start, endDate: end },
            stateReservation: 'Pendiente',
            state: true
        });

        await reservation.save();

        return res.status(201).json({
            success: true,
            msg: 'Reservation created successfully',
            reservation
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error creating reservation',
            error: error.message
        });
    }
};

export const viewReservations = async (req, res = response) => {
    const { limite = 100, desde = 0 } = req.query;
    const query = { state: true };

    try {
        const reservations = await Reservation.find(query)
            .populate({path: 'keeperUser', match: {state:true}, select: 'username'})
            .populate({
                path: 'keeperRoom',
                match: { state: true },
                select: 'typeRoom keeperHotel',
                populate: {
                    path: 'keeperHotel',
                    match: { state: true },
                    select: 'nameHotel'
                }
            })
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await Reservation.countDocuments(query);

        return res.status(200).json({
            success: true,
            msg: 'Reservations retrieved successfully',
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

export const viewReservationsByHotel = async (req, res = response) => {
    const { idHotel } = req.params;
    const { limite = 100, desde = 0 } = req.query;

    try {
        const reservations = await Reservation.find({ state: true })
            .populate({
                path: 'keeperUser',
                match: { state: true },
                select: 'username'
            })
            .populate({
                path: 'keeperRoom',
                match: { state: true },
                select: 'typeRoom keeperHotel',
                populate: {
                    path: 'keeperHotel',
                    match: { _id: idHotel, state: true },
                    select: 'nameHotel'
                }
            })
            .skip(Number(desde))
            .limit(Number(limite));

        // Filtrar manualmente las reservaciones con habitaciones cuyo hotel coincide
        const filteredReservations = reservations.filter(
            reservation => reservation.keeperRoom?.keeperHotel
        );

        return res.status(200).json({
            success: true,
            msg: `Reservations for hotel ID: ${idHotel}`,
            total: filteredReservations.length,
            reservations: filteredReservations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error retrieving reservations for hotel',
            error: error.message
        });
    }
};

export const updateReservation = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ success: false, msg: 'Reservation not found' });
        }

        const room = await Room.findById(reservation.keeperRoom);
        if (!room) {
            return res.status(404).json({ success: false, msg: 'Associated room not found' });
        }

        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        // Validar traslape con otras reservas en la misma habitación
        const conflict = await Reservation.findOne({
            _id: { $ne: reservation._id },
            keeperRoom: room._id,
            state: true,
            $or: [
                {
                    'datesReservation.startDate': { $lte: newEnd },
                    'datesReservation.endDate': { $gte: newStart }
                }
            ]
        });

        if (conflict) {
            return res.status(409).json({ success: false, msg: 'Conflict with another reservation in selected range' });
        }

        reservation.datesReservation.startDate = newStart;
        reservation.datesReservation.endDate = newEnd;
        await reservation.save();

        return res.status(200).json({
            success: true,
            msg: 'Reservation updated',
            reservation
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error updating reservation',
            error: error.message
        });
    }
};

export const cancelReservation = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { confirm } = req.body;

        const reservation = await Reservation.findById(id);
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

export const confirmReservation = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { ConfirmReservation } = req.body;
        
        if (!ConfirmReservation) {
            return res.status(400).json({
                success: false,
                msg: 'Please confirm reservation by resending with { "ConfirmReservation": true }'
            });
        }

        await Reservation.findByIdAndUpdate(id, 
            {
                stateReservation: 'Confirmada',
                state: true
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            msg: 'Reservation confirmed',
            reservation: await Reservation.findById(id)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error confirming reservation',
            error: error.message
        });
    }
};
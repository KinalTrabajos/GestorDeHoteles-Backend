import { response } from "express";
import Reservation from './reservation.model.js';
import User from "../users/user.model.js";
import Room from "../rooms/room.model.js";
import { listDatesInRange } from "../helpers/roomDates.js";

export const addReservation = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate }  = req.body;
        const userId = req.usuario._id; 

        const room = await Room.findById(id);

        const start = new Date(startDate), end = new Date(endDate);
        const newDates = listDatesInRange(start, end);

        // 1) Validar que todas las fechas del rango están disponibles
        const unavailable = newDates.filter(iso =>
            !room.datesAvialableRoom.some(d =>
                d.date.toISOString().slice(0,10) === iso && d.availabilityRoom
            )
            );
            if (unavailable.length) {
            return res.status(400).json({
                success: false,
                msg: `Dates not available: ${unavailable.join(', ')}`
            });
        }
        

        const existing = await Reservation.findOne({
            keeperRoom: room._id,
            keeperUser: userId,
            'datesReservation.startDate': start,
            'datesReservation.endDate': end
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                msg: 'Reservation already exists for this room, user and dates'
            });
        }

        const reservation = new Reservation({
            keeperUser: userId,
            keeperRoom: room._id,
            datesReservation: { 
                startDate: start, 
                endDate: end 
            },
            state: true
        });
        await reservation.save();

        // 3) Marcar cada fecha en room como no disponible + keeperUser
        room.datesAvialableRoom.forEach(d => {
            if (newDates.includes(d.date.toISOString().slice(0,10))) {
                d.availabilityRoom = false;
                d.keeperUser       = userId;
            }
        });
        await room.save();

        return res.status(201).json({
            success: true,
            msg: 'Reservation created',
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
            .populate({path: 'keeperRoom', match: {state:true}, select: 'typeRoom'})
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

export const updateReservation = async (req, res = response) => {
    try {
        const { id } = req.params;                
        const { startDate: newStart, endDate: newEnd } = req.body;
        const userId = req.usuario._id;           

        // 1) Carga reserva + habitación
        const reservation = await Reservation.findById(id);
        if (!reservation) {
        return res.status(404).json({ success: false, msg: 'Reservation not found' });
        }

        const room = await Room.findById(reservation.keeperRoom);
        if (!room) {
            return res.status(404).json({ success: false, msg: 'Associated room not found' });
        }
        
        // 2) Rango antiguo y revertir
        const oldStart = new Date(reservation.datesReservation.startDate);
        const oldEnd   = new Date(reservation.datesReservation.endDate);
        const oldDates = listDatesInRange(oldStart, oldEnd);
        room.datesAvialableRoom.forEach(d => {
            const iso = d.date.toISOString().slice(0,10);
            if (oldDates.includes(iso)) {
                d.availabilityRoom = true;
                d.keeperUser       = undefined;
            }
        });

        // 3) Rango nuevo y validar
        const start = new Date(newStart), end = new Date(newEnd);
        const newDates = listDatesInRange(start, end);
        const unavailable = newDates.filter(iso =>
            !room.datesAvialableRoom.some(d =>
            d.date.toISOString().slice(0,10) === iso && d.availabilityRoom
            )
        );
        if (unavailable.length) {
            return res.status(400).json({
                success: false,
                msg: `Dates not available: ${unavailable.join(', ')}`
            });
        }

        // 4) Marcar nuevas fechas
        room.datesAvialableRoom.forEach(d => {
            const iso = d.date.toISOString().slice(0,10);
            if (newDates.includes(iso)) {
                d.availabilityRoom = false;
                d.keeperUser       = userId;
            }
        });
        await room.save();
    
          // 5) Actualizar reserva
        reservation.datesReservation = { startDate: start, endDate: end };
        await reservation.save();

    
        return res.status(200).json({
            success: true,
            msg: 'Reservation updated successfully',
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
        const { confirm } = req.body;   // esperamos { confirm: true } para confirmar
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ success: false, msg: 'Reservation not found' });
        }
    
        // Si no vino confirmación, devolvemos los detalles y pedimos confirmación
        if (!confirm) {
            return res.status(200).json({
            success: true,
            msg: 'Please confirm cancellation by resending with { "confirm": true }',
            reservation: {
                id: reservation._id,
                startDate: reservation.datesReservation.startDate,
                endDate:   reservation.datesReservation.endDate,
                state:     reservation.stateReservation
            }
        });
        }

        // Ya confirmado: revertimos la disponibilidad
        const room = await Room.findById(reservation.keeperRoom);
        if (room) {
            const start = new Date(reservation.datesReservation.startDate);
            const end   = new Date(reservation.datesReservation.endDate);
            const datesToRestore = listDatesInRange(start, end);
            
            room.datesAvialableRoom.forEach(d => {
                const iso = d.date.toISOString().slice(0,10);
                if (datesToRestore.includes(iso)) {
                    d.availabilityRoom = true;
                    d.keeperUser       = undefined;
                }
            });
            await room.save();
        }
    
        // Marcamos la reserva como cancelada
        reservation.state = false;
        reservation.stateReservation = 'Cancelada';
        await reservation.save();
    
        return res.status(200).json({
            success: true,
            msg: 'Reservation cancelled and availability restored',
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

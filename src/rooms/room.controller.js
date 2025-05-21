import { response } from "express";
import Hotel from "../hotels/hotel.model.js";
import Room from "./room.model.js";

export const addRoom = async (req, res = response) => {
    try {
        const data = req.body;
        const userId = req.usuario._id; 
        const hotel = await Hotel.findOne({nameHotel: data.nameHotel});

        const room = new Room({
            typeRoom: data.typeRoom,
            descriptionRoom: data.descriptionRoom,
            capacityRoom: data.capacityRoom,
            priceRoom: data.priceRoom,
            datesAvialableRoom: [{
                date: new Date(data.date)
            }],
            keeperHotel: hotel._id,
            keeperAdmin: userId
        });

        await room.save();

        await Hotel.findByIdAndUpdate(hotel._id, {
            $push: { keeperRooms: room._id}
        });

        res.status(200).json({
            success: true,
            msg: 'Room created successfully',
            room
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error creating room',
            error: error.message
        })
    }
};

export const viewRooms = async (req, res = response) => {
    const { limite = 100, desde = 0 } = req.query;
    const query = { state: true };

    try {
        const rooms = await Room.find(query)
            .populate({path: 'keeperHotel', match: {state:true}, select: 'nameHotel'})
            .populate({path: 'keeperAdmin', match: {state:true}, select: 'name'})
            .populate({path: 'datesAvialableRoom.keeperUser', match: {state: true}, select: 'username'})
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await Room.countDocuments(query);

        res.status(200).json({
            success: true,
            msg: 'Rooms retrieved successfully',
            total,
            rooms
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error retrieving rooms',
            error: error.message
        })
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, date, ...data } = req.body;
        const hotel = await Hotel.findOne({nameHotel : data.nameHotel});

        const room = await Room.findByIdAndUpdate(
            id, 
            {
                ...data,
                keeperHotel: hotel._id,
                state: true,
            },
            { new: true });

        res.status(200).json({
            success: true,
            msg: 'Room updated successfully',
            room
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating room',
            error: error.message
        })
    }
};

export const updateDateAvailableRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const room = await Room.findByIdAndUpdate(
            id, 
            {
                $push: {
                    datesAvialableRoom: [{
                        date: new Date(data.date)
                    }]
                },
                state: true,
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            msg: 'Date avialable roomupdated successfully',
            room
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating room',
            error: error.message
        })
    }
};

export const deleteRoom = async (req, res) => {
    const { id } = req.params;

    try {
        await Room.findByIdAndUpdate(id, { state: false });

        res.status(200).json({
            success: true,
            message: 'Room disabled.',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting Room',
            error: error.message,
        });
    }
};  
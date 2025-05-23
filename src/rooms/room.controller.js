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
            keeperHotel: hotel._id,
            keeperAdmin: userId,
            numberRoom: data.numberRoom
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

        const existingRoom = await Room.findById(id);
        if (!existingRoom) {
            return res.status(404).json({
                success: false,
                msg: 'Room not found'
            });
        }

        const newHotel = await Hotel.findOne({ nameHotel: data.nameHotel, state: true });
        if (!newHotel) {
            return res.status(404).json({
                success: false,
                msg: 'New hotel not found'
            });
        }

        const oldHotelId = existingRoom.keeperHotel?.toString();
        const newHotelId = newHotel._id.toString();

        // Solo si cambia el hotel, actualizar las referencias
        if (oldHotelId && oldHotelId !== newHotelId) {
            await Hotel.findByIdAndUpdate(oldHotelId, {
                $pull: { keeperRooms: existingRoom._id }
            });

            await Hotel.findByIdAndUpdate(newHotelId, {
                $addToSet: { keeperRooms: existingRoom._id }
            });
        }

        // Luego actualiza la habitación con el nuevo hotel
        const roomUpdate = await Room.findByIdAndUpdate(
            id,
            {
                ...data,
                keeperHotel: newHotel._id,
                state: true,
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            msg: 'Room updated successfully',
            roomUpdate
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating room',
            error: error.message
        });
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
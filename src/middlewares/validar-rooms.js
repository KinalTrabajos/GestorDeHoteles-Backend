import { request, response } from "express";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.model.js";

export const validateCapacityAndPriceAndNumberRoom = async (req = request, res = response, next) => {
    const { capacityRoom, priceRoom } = req.body;

    try {
        if (capacityRoom < 1) {
            return res.status(400).json({
                success: false,
                msg: 'Capacity must be at least 1.'
            });
        }

        if (priceRoom < 1) {
            return res.status(400).json({
                success: false,
                msg: 'Price must be at least 1.'
            });
        }

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: 'Error validating room',
            error: error.message
        })
    }
};

export const validateRoomExists = async (req = request, res = response, next) => {
    try {
        const {numberRoom, nameHotel} = req.body;
        const hotel = await Hotel.findOne({ nameHotel });

        if (!hotel) {
            return res.status(400).json({
                success: false,
                msg: 'Hotel not found.'
            });
        }
        const existingRoom = await Room.findOne({
            numberRoom,
            keeperHotel: hotel._id,
            state: true
        });
        if (existingRoom) {
            return res.status(400).json({
                success: false,
                msg: 'Room number already exists in this hotel.'
            });
        }

        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: 'Error validating room',
            error: error.message
        })
    }
};

export const confirmDeleteRoom = async (req = request, res = response, next) => {
    const { confirm } = req.body;
    
    if (!confirm) {
        return res.status(400).json({
            success: false,
            msg: 'Please confirm deletion'
        });
    };

    next();
};
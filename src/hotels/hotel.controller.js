import { response } from "express";
import Hotel from './hotel.model.js';
import Room from "../rooms/room.model.js";
import Category from "../categories/category.model.js";
import User from "../users/user.model.js";

export const addHotel = async (req, res = response) => {
    try {
        const { nameHotel, hotelAddresss, typeService, description, priceService } = req.body;
        const userId = req.usuario._id; 
        const category = req.category;

        const hotel = new Hotel({
            nameHotel,
            hotelAddresss,
            services: [{ 
                typeService, 
                description, 
                priceService 
            }],
            keeperCategory: category._id,
            keeperAdmin: userId
        });

        await hotel.save();

        await Category.findByIdAndUpdate(category._id, {
            $push: { keeperHotel: hotel._id}
        });

        res.status(200).json({
            success: true,
            msg: 'Hotel created successfully',
            hotel
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error creating hotel',
            error: error.message
        })
    }
};

export const viewHotels = async (req, res = response) => {
    const { limite = 100, desde = 0 } = req.query;
    const query = { state: true };

    try {

        const hotels = await Hotel.find(query)
            .populate({path: 'keeperCategory', match: {state:true}, select: 'typeCategory'})
            .populate({path: 'keeperAdmin', match: {state:true}, select: 'name'})
            .populate({path: 'keeperRooms', match: {state:true}, select: 'typeRoom capacityRoom priceRoom datesAvialableRoom'})
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await Hotel.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            hotels
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error getting hotels',
            error: error.message
        })
    }
};

export const updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const category = await Category.findOne({typeCategory : data.typeCategory});
        
        const hotel = await Hotel.findByIdAndUpdate (
            id, 
            {
                ...data,
                $push:{
                    services: [{
                        typeService: data.typeService,
                        description: data.description,
                        priceService: data.priceService
                    }]
                },
                keeperCategory: category._id,
                state: true
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            msg: 'Hotel updated successfully',
            hotel
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating hotel',
            error: error.message
        })
    }
};

export const deleteHotel = async (req, res) => {
    const { id } = req.params;

    try {
        await Hotel.findByIdAndUpdate(id, { state: false });

        res.status(200).json({
            success: true,
            message: 'Hotel disabled.',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting Hotel',
            error: error.message,
        });
    }
};


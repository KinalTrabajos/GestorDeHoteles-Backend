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
            .populate({ path: 'keeperEvents', match: { state: true }, select: 'nameEvent description' }) 
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

        const existingHotel = await Hotel.findById(id);

        const newCategory = await Category.findOne({ typeCategory : data.typeCategory, state: true });

        const oldCategoryId = existingHotel.keeperCategory?.toString();
        const newCategoryId = newCategory._id.toString();
        
        if(oldCategoryId && oldCategoryId !== newCategoryId) {
            await Category.findByIdAndUpdate(oldCategoryId, {
                $pull: { keeperHotel: existingHotel._id }
            });

            await Category.findByIdAndUpdate(newCategoryId, {
                $push: { keeperHotel: existingHotel._id }
            });
        }

        const hotelUpdate = await Hotel.findByIdAndUpdate (
            id, 
            {
                ...data,
                keeperCategory: newCategory._id,
                state: true
            },
            { new: true }
        );


        res.status(200).json({
            success: true,
            msg: 'Hotel updated successfully',
            hotelUpdate
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

export const addServices = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const hotel = await Hotel.findByIdAndUpdate(
            id, 
            {
                $addToSet: {
                    services: data.services,
                },
                state: true
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            msg: 'Event updated successfully',
            hotel
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error adding services',
            error: error.message
        })
    }
};


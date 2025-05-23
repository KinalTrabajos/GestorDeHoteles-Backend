import { request, response } from "express";
import Hotel from "../hotels/hotel.model.js";
import Category from "../categories/category.model.js";

export const existsHotelName = async (req = request, res = response, next) => {
    const { nameHotel } = req.body;

    const hotelExists = await Hotel.findOne({ nameHotel: nameHotel?.trim(), state: true });

    if (hotelExists) {
        return res.status(400).json({
            success: false,
            msg: 'Hotel with that name already exists.'
        });
    }

    next();
};

export const existsHotelAddress = async (req = request, res = response, next) => {
    const { hotelAddresss } = req.body;

    const addressExists = await Hotel.findOne({ hotelAddresss: hotelAddresss?.trim(), state: true });

    if (addressExists) {
        return res.status(400).json({
            success: false,
            msg: 'Hotel with that address already exists.'
        });
    }

    next();
};

export const categoryExists = async (req = request, res = response, next) => {
    const { typeCategory } = req.body;

    const category = await Category.findOne({ typeCategory: typeCategory?.trim(), state: true });

    if (!category) {
        return res.status(404).json({
            success: false,
            msg: 'Category not found.'
        });
    }

    req.category = category;
    next();
};

export const confirmHotelDeletion = async (req = request, res = response, next) => {
    const { confirm } = req.body;

    if (!confirm) {
        return res.status(400).json({
            success: false,
            msg: 'Please confirm deletion'
        });
    }

    next();
};
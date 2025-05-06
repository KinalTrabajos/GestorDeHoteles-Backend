import { response } from "express";
import Event from "./event.model.js";
import Hotel from "../hotels/hotel.model.js";

export const addEvent = async (req, res = response) => {
    try {
        const data = req.body;

        const hotel = await Hotel.findOne({nameHotel: data.nameHotel});

        const event = new Event({
            nameEvent: data.nameEvent,
            description: data.description,
            dateEvent: new Date(data.dateEvent),
            keeperHotel: hotel._id,
            additionalServices: [{
                typeService: data.typeService,
                descriptionServices: data.descriptionServices,
                priceService: data.priceService
            }],
            state: true
        });

        await event.save();

        await Hotel.findByIdAndUpdate(hotel._id, {
            $addToSet: { keeperEvents: event._id }
        });

        res.status(200).json({
            success: true,
            msg: 'Event created successfully',
            event
        })

    } catch (error) {
        res.status(400).json({ 
            success: false,
            msg: 'Error creating event',
            error: error.message 
        });
    }
};

export const getEvents = async (req, res = response) => {
    try {
        const {limite = 100, desde = 0} = req.query;
        const query = {state: true};

        const events = await Event.find(query)
            .populate({path: 'keeperHotel', match: {state:true}, select: 'nameHotel'})
            .skip(Number(desde))
            .limit(Number(limite));
            
        const total = await Event.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            events
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: 'Error retrieving events',
            error: error.message
        });
    }
};

export const updateEvent = async (req, res = response) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const event = await Event.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            success: true,
            msg: 'Event updated successfully',
            event
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: 'Error updating event',
            error: error.message
        });
    }
};


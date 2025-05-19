import Event from './event.model.js';
import Hotel from '../hotels/hotel.model.js';
import { response } from "express";

export const addEventGeneral = async (req, res = response) => {
    try {
        const data = req.body;

        const hotel = await Hotel.findOne({ nameHotel : data.nameHotel });

        const event = await Event({
            nameEvent: data.nameEvent,
            description: data.description,
            datesEvent: {
                startDate: data.startDate,
                endDate: data.endDate
            },
            keeperHotel: hotel._id,
            additionalServices: [{
                typeService: data.typeService,
                descriptionServices: data.descriptionServices,
                priceService: data.priceService
            }],
            typeEvent: 'Evento_General',
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
        res.status(500).json({
            success: false,
            msg: 'Error creating event',
            error: error.message
        })
    }
};

export const addEventPrivate = async (req, res = response) => {
    try {
        const data = req.body;

        const hotel = await Hotel.findOne({ nameHotel : data.nameHotel });

        const event = await Event({
            nameEvent: data.nameEvent,
            description: data.description,
            keeperHotel: hotel._id,
            additionalServices: [{
                typeService: data.typeService,
                descriptionServices: data.descriptionServices,
                priceService: data.priceService
            }],
            typeEvent: 'Evento_Privado',
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
        res.status(500).json({
            success: false,
            msg: 'Error creating event',
            error: error.message
        })
    }
};

export const getEvents = async (req, res = response) => {
    const { limite = 100, desde = 0 } = req.query;
    const query = { state: true };

    try {

        const events = await Event.find(query)
            .populate({path: 'keeperHotel', match: {state:true}, select: 'nameHotel'})
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await Event.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            events
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error getting events',
            error: error.message
        })
    }               
};

export const deleteEvents = async (req, res = response) => {
    const { id } = req.params;

    try {
        await Event.findByIdAndUpdate(id, { state: false });

        res.status(200).json({
            success: true,
            msg: 'Event deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting event',
            error: error.message
        })
    }
};

export const updateEvent = async (req, res = response) => {
    try {
        
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const event = await Event.findByIdAndUpdate (
            id, 
            {
                nameEvent: data.nameEvent,
                description: data.description,
                datesEvent: {
                    startDate: data.startDate,
                    endDate: data.endDate
                },
                state: true
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            msg: 'Event updated successfully',
            event
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating event',
            error: error.message
        })
    }
};

export const updateServicesEvent = async (req, res) => {
    try {
        
        const { id } = req.params;
        const { _id, data } = req.body;

        
        console.log('REQ.BODY:', req.body);
        
        const event = await Event.findByIdAndUpdate (
            id, 
            {
                $push: {
                    additionalServices: {
                        $each: [{
                            typeService: data.typeService,
                            descriptionServices: data.descriptionServices,
                            priceService: data.priceService
                        }]
                    }
                },
                state: true
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            msg: 'Event updated successfully',
            event
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating event',
            error: error.message
        })
    }
};


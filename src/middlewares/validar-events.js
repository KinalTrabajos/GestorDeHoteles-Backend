import Event from '../EventsHotels/event.model.js';
import Hotel from '../hotels/hotel.model.js';

export const validateUniqueEventName = async (req, res, next) => {
    try {
        const { nameEvent } = req.body;

        const exists = await Event.findOne({ nameEvent });
        if (exists) {
            return res.status(400).json({
                success: false,
                msg: 'An event with this name already exists'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error validating event name',
            error: error.message
        });
    }
};

export const validateDuplicateEventDates = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body;

        const exists = await Event.findOne({
            'datesEvent.startDate': new Date(startDate),
            'datesEvent.endDate': new Date(endDate)
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                msg: 'An event already exists with the same start and end dates'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error validating event dates',
            error: error.message
        });
    }
};

export const validateUniqueTypeServices = (req, res, next) => {
    try {
        const { additionalServices } = req.body;

        if (!Array.isArray(additionalServices)) {
            return res.status(400).json({
                success: false,
                msg: 'additionalServices must be an array'
            });
        }

        const typeServices = additionalServices.map(service => service.typeService);

        const uniqueTypes = new Set(typeServices);
        if (uniqueTypes.size !== typeServices.length) {
            return res.status(400).json({
                success: false,
                msg: 'Duplicate typeService values found in additionalServices'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error validating typeService uniqueness',
            error: error.message
        });
    }
};
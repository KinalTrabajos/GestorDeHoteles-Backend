import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

import { 
    addEventGeneral, 
    addEventPrivate, 
    getEvents, 
    deleteEvents, 
    updateEvent,
    updateServicesEvent
} from './event.controller.js'

import { 
    validateUniqueEventName,
    validateDuplicateEventDates,
    validateUniqueTypeServices
}
from '../middlewares/validar-events.js'

const router = Router();

router.post(
    "/addEventGeneral",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        validateUniqueEventName,
        validateDuplicateEventDates,
        validateUniqueTypeServices,
        validarCampos
    ],
    addEventGeneral
);

router.post(
    "/addEventPrivate",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        validateUniqueEventName,
        validateUniqueTypeServices,
        validarCampos
    ],
    addEventPrivate
);

router.get("/viewEvents", getEvents);

router.delete(
    "/deleteEvent/:id", 
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
    ],
    deleteEvents
);
    
router.put(
    "/updateEventGeneral/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        validarCampos
    ],
    updateEvent
);

router.put(
    "/updateEventPrivate/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        validarCampos
    ],
    updateEvent
);

router.put(
    "/updateServicesEvent/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        validateUniqueTypeServices,
        validarCampos
    ],
    updateServicesEvent
);

export default router;
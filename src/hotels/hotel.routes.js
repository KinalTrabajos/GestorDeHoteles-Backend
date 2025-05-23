import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

import { addHotel, viewHotels, updateHotel, deleteHotel } from './hotel.controller.js'

import { existsHotelName, existsHotelAddress, categoryExists, confirmHotelDeletion} from "../middlewares/validar-hotel.js";

const router = Router();

router.post(
    "/addHotel",
    [
        validarJWT,
        tieneRole('PLATAFORM_ADMIN', 'HOTEL_ADMIN'),
        existsHotelName,
        existsHotelAddress,
        categoryExists,
        validarCampos
    ],
    addHotel
);

router.get("/viewHotels", viewHotels);

router.put(
    "/updateHotel/:id",
    [
        validarJWT,
        tieneRole('PLATAFORM_ADMIN', 'HOTEL_ADMIN'),
        check("id", "It is not a valid id").isMongoId(),
        validarCampos
    ],
    updateHotel
);

router.delete(
    "/deleteHotel/:id",
    [
        validarJWT,
        tieneRole('PLATAFORM_ADMIN', 'HOTEL_ADMIN'),
        confirmHotelDeletion,
        check("id", "It is not a valid id").isMongoId(),
        validarCampos
    ],
    deleteHotel
);

export default router;
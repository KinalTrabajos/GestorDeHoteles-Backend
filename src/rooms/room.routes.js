import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

import { addRoom, viewRooms, updateRoom, updateDateAvailableRoom, deleteRoom } from './room.controller.js'

const router = Router();

router.post(
    "/addRoom",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        validarCampos
    ],
    addRoom
);

router.get("/viewRooms",viewRooms);

router.put(
    "/updateRoom/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        validarCampos
    ],
    updateRoom
);

router.put(
    "/updateDateAvailableRoom/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        check("id", "It is not a valid id").isMongoId(),
        validarCampos
    ],
    updateDateAvailableRoom
);

router.delete(
    "/deleteRoom/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        check("id", "It is not a valid id").isMongoId(),
        validarCampos
    ],
    deleteRoom
);


export default router;
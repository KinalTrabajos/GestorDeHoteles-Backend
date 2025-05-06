import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

import { addEvent, getEvents } from './event.controller.js'

const router = Router();

router.post(
    "/addEvent",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        validarCampos
    ],
    addEvent
);

router.get("/viewEvents", getEvents);
    
export default router;
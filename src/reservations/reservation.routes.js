import {Router} from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import {check} from "express-validator";
import {existeUsuarioById} from '../helpers/db.validator.js';
import {validarCampos} from '../middlewares/validar-campos.js';

import { addReservation, viewReservations, updateReservation, cancelReservation } from './reservation.controller.js';

const router = Router();

router.post(
    "/addReservation/:id",
    [
        validarJWT,
        validarCampos
    ],
    addReservation
);

router.get("/viewReservations", viewReservations);

router.put(
    "/updateReservation/:id",
    [
        validarJWT,
        validarCampos
    ],
    updateReservation
);

router.delete(
    "/cancelReservation/:id",
    [
        validarJWT,
        check("id", "It is not a valid id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    cancelReservation
);



export default router;
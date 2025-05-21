import { Router } from "express";
import { check } from "express-validator";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js" 
import { existeUsuarioById } from '../helpers/db.validator.js';
import { validarCampos } from '../middlewares/validar-campos.js';

import { 
    addReservation, 
    viewReservations, 
    updateReservation, 
    cancelReservation,
    confirmReservation,
    viewReservationsByHotel 
} from './reservation.controller.js';

import { 
    addReservationEvent,
    viewEventReservations,
    updateEventReservation,
    cancelEventReservation,
    confirmReservationEvent 
} from './reservationEvent.controller.js';

const router = Router();

//Reservas de rooms

router.post(
    "/addReservation/:id",
    [
        validarJWT,
        check("id", "It is not a valid id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    addReservation
);

router.get("/viewReservations", viewReservations);
router.get("/viewReservationsByHotel/:idHotel", viewReservationsByHotel);

router.put(
    "/updateReservation/:id",
    [
        validarJWT,
        check("id", "It is not a valid id").isMongoId(),
        check("id").custom(existeUsuarioById),
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

router.put(
    "/confirmReservation/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        check("id", "It is not a valid id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    confirmReservation
);


//Reservas de eventos

router.post(
    "/addReservationEvent/:id",
    [
        validarJWT,
        check("id", "It is not a valid id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    addReservationEvent
);

router.get("/viewReservationsEvent", viewEventReservations);

router.put(
    "/updateEventReservation/:id",
    [
        validarJWT,
        check("id", "It is not a valid id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updateEventReservation
);

router.delete(
    "/cancelEventReservation/:id",
    [
        validarJWT,
        check("id", "It is not a valid id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    cancelEventReservation
);

router.put(
    "/confirmReservationEvent/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        check("id", "It is not a valid id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    confirmReservationEvent
);

export default router;
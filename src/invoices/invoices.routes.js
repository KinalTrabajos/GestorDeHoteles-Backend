import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

import { viewInvoices, deleteInvoice } from './invoices.controller.js'

const router = Router();

router.get("/viewInvoices",viewInvoices);

router.delete(
    "/deleteInvoice/:id",
    [
        validarJWT,
        tieneRole('HOTEL_ADMIN'),
        check("id", "It is not a valid id").isMongoId(),
        validarCampos
    ],
    deleteInvoice
)

export default router;
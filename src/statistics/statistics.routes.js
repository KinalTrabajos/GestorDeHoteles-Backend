import { Router } from "express";
import { check } from "express-validator";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js" 
import { existeUsuarioById } from '../helpers/db.validator.js';
import { validarCampos } from '../middlewares/validar-campos.js';

import { mostRequestedHotels, monthlyOccupancy } from './statistics.controller.js';

const router = Router();

router.get("/mostRequestedHotels", mostRequestedHotels);

router.get("/monthlyOccupancy", monthlyOccupancy);

export default router;
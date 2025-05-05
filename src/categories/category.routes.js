import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";
import { existingNameCategory, validateDefaultCategory, confirmAction } from "../middlewares/validar-category.js";

import { addCategory, categoryView, deleteCategory, updateCategory } from './category.controller.js'

const router = Router();

router.post(
    "/addCategory",
    [
        validarJWT,
        tieneRole('PLATAFORM_ADMIN'),
        existingNameCategory,
        validarCampos
    ],
    addCategory
);

router.get("/viewCategories", categoryView);

router.delete(
    "/:id",
    [
        validarJWT,
        tieneRole('PLATAFORM_ADMIN'),
        confirmAction,
        validateDefaultCategory,
        check("id", "It is not a valid id").isMongoId(),
        validarCampos         
    ],
    deleteCategory
);

router.put(
    "/:id",
    [
        validarJWT,
        tieneRole("PLATAFORM_ADMIN"),
        check("id", "It is not a valid id").isMongoId(),
        validarCampos
    ],
    updateCategory
);

export default router;
import {Router} from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import {check} from "express-validator";
import {existeUsuarioById} from '../helpers/db.validator.js';
import {validarCampos} from '../middlewares/validar-campos.js';
import { tieneRole } from "../middlewares/validar-roles.js";

import {
    preventEmailOrPasswordUpdate, 
    validateOldPassword, 
    confirmDeletionMiddleware, 
    validateUserExists, 
    validateUserRole,
    validateUserOnlyDelete
} from '../middlewares/validar-users.js';

import { usersView, updateUser, updatePassword, deleteUser, updateRole } from './user.controller.js';


const router = Router();

router.get( "/usersView", usersView);

router.put(
    "/updateUser",
    [
        validarJWT,
        preventEmailOrPasswordUpdate,
        check("id", "No es un Id valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updateUser
);

router.put(
    "/passwordUpdate",
    [
        validarJWT,
        validateOldPassword,
        check("id", "No es un Id válido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updatePassword
);  

router.delete(
    "/userDelete/:id",
    [
        validarJWT,
        confirmDeletionMiddleware,
        validateUserOnlyDelete,
        check("id", "No es un Id válido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    deleteUser
); 

router.put(
    "/updateRole/:id",
    [   
        validarJWT,
        tieneRole("AHOTEL_ADMIN"),
        validateUserExists,
        validateUserRole,
        check("id", "No es un Id válido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updateRole
); 
export default router;
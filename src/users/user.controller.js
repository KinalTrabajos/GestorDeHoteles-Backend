import { response } from "express";
import {hash, verify} from "argon2";
import User from './user.model.js';

export const usersView = async (req, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { state: true };

        const users = await User.find(query)
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error getting users",
            error: error.message
        });
    }
};

export const updateUser = async (req, res  = response) => {
    try {
        const id = req.usuario._id;
        const {_id, password, email, ...data} = req.body; 

        const user = await User.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            succes: true,
            msj: 'User updated successfully',
            user
        })
    } catch (error) {
        res.status(500).json({
            succes: false,
            msj: 'Error updating user',
            error: error.message
        })
    }
};

export const updatePassword = async (req, res) => {
    try {
        const id = req.usuario._id;
        const { passwordNew } = req.body;

        const passwordUpdate = await hash(passwordNew)
        await User.findByIdAndUpdate(id, { password: passwordUpdate });

        res.status(200).json({
            success: true,
            msg: 'Password updating successfully'
        });

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to update password',
            error: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {

        await User.findByIdAndUpdate(id, { state: false });

        res.status(200).json({
            success: true,
            message: 'User disabled.',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting User',
            error: error.message,
        });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        await User.findByIdAndUpdate(id, { role });

        res.status(200).json({
            success: true,
            msg: 'User role updated successfully'
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to update user role',
            error: error.message
        });
    }
};

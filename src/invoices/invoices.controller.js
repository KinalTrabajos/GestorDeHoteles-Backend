import { response } from "express";
import Invoice from './invoices.model.js';

export const viewInvoices = async (req, res = response) => {
    try {
        const { limite = 100, desde = 0 } = req.query;
        const query = { state : true };

        const invoices = await Invoice.find(query)
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await Invoice.countDocuments(query);

        return res.status(200).json({
            success: true,
            msg: 'Invoices retrieved successfully',
            total,
            invoices
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error retrieving invoices',
            error: error.message
        });
    }
};

export const deleteInvoice = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { confirm } = req.body;

        if (!confirm) {
            return res.status(200).json({
                success: true,
                msg: 'Please confirm deletion with { "confirm": true }',
                invoice: {
                    id: id,
                    state: false
                }
            });
        }
        await Invoice.findByIdAndUpdate(id, { state: false });

        res.status(200).json({
            success: true,
            msg: 'Invoice deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting invoice',
            error: error.message
        });
    }
};
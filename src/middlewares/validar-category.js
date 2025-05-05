import Category from "../categories/category.model.js";

export const existingNameCategory = async (req, res, next) => {
    try {
        const { typeCategory } = req.body;
        const category = await Category.findOne({ typeCategory: typeCategory.trim() });
        if (category) {
            return res.status(400).json({
                success: false,
                msg: 'Category already exists'
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error validating category',
            error: error.message
        })
    }
};

export const validateDefaultCategory = async (req, res, next) => {
    try {
        const defaultCategory = await Category.findOne({ typeCategory: "GlobalCategory", state: true });
        if (!defaultCategory) {
            return res.status(400).json({
                success: false,
                message: 'The default category "GlobalCategory" does not exist or is disabled.',
            });
        }

        req.defaultCategory = defaultCategory;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating default category',
            error: error.message,
        });
    }
};

export const confirmAction = (req, res, next) => {
    const { confirmDeletion } = req.body;

    if (confirmDeletion !== true) {
        return res.status(400).json({
            success: false,
            msg: 'Action not confirmed.'
        });
    }

    next();
};

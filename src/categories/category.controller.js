import { response } from "express";
import Category from './category.model.js';

const createCategory = async ( typeCategory, description, state) => {
    try {

        if (typeCategory === "GlobalCategory") {
                const existCategory = await Category.findOne({ typeCategory: "GlobalCategory" });
                if (existCategory) {
                    console.log("--------------------------- Error ------------------------------------");
                    console.log(`The named category ${typeCategory} already exists. New one cannot be created.`);
                    console.log("----------------------------------------------------------------------");
                    return null;
                };
            };

    const newCategory = new Category({ 
        typeCategory,
        description,
        state});
        
        await newCategory.save();
        console.log("Category created successfully:", newCategory);
        return newCategory;
        
    } catch (error) {
        console.error("Error creating category:", error);
        return null;
    }
};

createCategory("GlobalCategory", "Here you will find all products without a defined category.", true);

export const addCategory = async (req, res) => {
    try {
        
        const data = req.body; 

        const category = new Category({
            typeCategory: data.typeCategory,
            description: data.description
        });

        await category.save();

        res.status(200).json({
            succes: true,
            category
        });

    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: 'Error creating category',
            error: error.message
        })
    }
};

export const categoryView = async (req, res) => {
    const {limite = 10, desde = 0} = req.query;
    const query = {state: true};

    try {
        
        const category = await Category.find(query)
            .populate({path: 'keeperHotel', match: {state:true}, select: 'nameHotel'})
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await Category.countDocuments(query);

        res.status(200).json({
            succes: true,
            total,
            category
        })
    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: 'Error getting categories',
            error: error.message
        })
    }
}; 

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const defaultCategory = req.defaultCategory;

    try {

        // await Product.updateMany({ keeperCategory: id }, { keeperCategory: defaultCategory._id });

        await Category.findByIdAndUpdate(id, { state: false });

        res.status(200).json({
            success: true,
            message: 'Category disabled and hotels reassigned to default category "GlobalCategory".',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting category',
            error: error.message,
        });
    }
};

export const updateCategory = async (req, res  = response) => {
    try {
        const {id} = req.params;
        const {_id, ...data} = req.body;

        const category = await Category.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            succes: true,
            msj: 'Category updated successfully',
            category
        })

    } catch (error) {
        res.status(500).json({
            succes: false,
            msj: "Error updating category",
            error: error.message
        })
    }
};

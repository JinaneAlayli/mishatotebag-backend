const Category = require('../models/Category');

//  Get All Categories (Public)
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        console.error(' Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
};

//  Create Category (Admin Only)
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) return res.status(400).json({ error: 'Category name is required.' });

        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) return res.status(400).json({ error: 'Category already exists.' });

        const newCategory = await Category.create({ name });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error(' Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category.' });
    }
};

//  Update Category (Admin Only)
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ error: 'Category not found.' });

        category.name = name || category.name;
        await category.save();

        res.status(200).json({ message: 'Category updated successfully.', category });
    } catch (error) {
        console.error(' Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category.' });
    }
};

// Delete Category (Admin Only)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ error: 'Category not found.' });

        await category.destroy();
        res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (error) {
        console.error(' Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category.' });
    }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };

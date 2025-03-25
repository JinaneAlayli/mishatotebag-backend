const Product = require('../models/Product');
const Category = require('../models/Category');
const path = require('path');
const fs = require('fs');
const OrderItem = require('../models/OrderItem');

const BASE_URL = 'http://localhost:5000'; // Ensure this is set correctly

// Function to properly construct the image URL by removing any leading slashes from the file path
const constructImageUrl = (imagePath) => {
  return `${BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
};


//  Get All Products (Public)
const getAllProducts = async (req, res) => {
    try {
        // Check user role from the JWT middleware
        const isAdmin = req.user && req.user.role === 'admin';

        // Build condition based on role
        const condition = isAdmin ? {} : { stock: { [require('sequelize').Op.gt]: 0 } };

        const products = await Product.findAll({
            where: condition,
            include: { model: Category, attributes: ['name'] }
        });

        // Map the product image paths to full URLs
        const updatedProducts = products.map(product => {
            const imagePaths = JSON.parse(product.image || '[]').map(image => constructImageUrl(image));
            return {
                ...product.toJSON(),
                image: imagePaths
            };
        });

        res.status(200).json(updatedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
};

// Get Product by ID (Public)
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: { model: Category, attributes: ['name'] }
        });
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        // Map image paths to full URLs
        const imagePaths = JSON.parse(product.image || '[]').map(image => constructImageUrl(image));
        res.status(200).json({
            ...product.toJSON(),
            image: imagePaths
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product.' });
    }
};

// Add Product (Admin Only)
const addProduct = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debugging
        console.log("Uploaded Files:", req.files); // Debugging

        const { name, description, price, category_id, stock } = req.body;
        const user_id = req.user.id;

        if (!name || !price || !category_id || !stock) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Generate image paths
        const imagePaths = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

        const product = await Product.create({
            name,
            description,
            price,
            category_id,
            stock,
            image: JSON.stringify(imagePaths),
            user_id
        });

        // Map image paths to full URLs before returning
        const updatedProduct = {
            ...product.toJSON(),
            image: imagePaths.map(image => constructImageUrl(image))
        };

        res.status(201).json({ message: 'Product added successfully!', product: updatedProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Product (Admin Only)
const updateProduct = async (req, res) => {
    try {
        const { name, price, category_id, stock, description, deleteImages } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (!product) return res.status(404).json({ error: 'Product not found.' });

        // Validate category existence
        if (category_id) {
            const categoryExists = await Category.findByPk(category_id);
            if (!categoryExists) return res.status(400).json({ error: 'Invalid category! Category does not exist.' });
        }

        // Handle multiple image updates
        let imageUrls = product.image ? JSON.parse(product.image) : []; // Keep existing images
        if (req.files && req.files.length > 0) {
            // Delete old images
            if (imageUrls.length > 0) {
                imageUrls.forEach(img => {
                    const oldImagePath = path.join(__dirname, '..', img);
                    if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
                });
            }
            // Store new image URLs
            imageUrls = req.files.map(file => `uploads/products/${file.filename}`);
        }

        await product.update({
            name,
            price,
            category_id,
            stock,
            description,
            image: JSON.stringify(imageUrls)  // Update images
        });

        // Map image paths to full URLs before returning
        const updatedProduct = {
            ...product.toJSON(),
            image: imageUrls.map(image => constructImageUrl(image))
        };

        res.status(200).json({ message: 'Product updated successfully.', product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product.' });
    }
};

// Delete Product (Admin Only)
const deleteProduct = async (req, res) => {
    try {
      const productId = req.params.id;
  
      // Check if product exists
      const product = await Product.findByPk(productId);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
  
      //   Check if product is used in any order items
      const existingOrderItem = await OrderItem.findOne({
        where: { product_id: productId },
      });
  
      if (existingOrderItem) {
        return res.status(400).json({
          error: 'Cannot delete this product. It exists in customer orders.',
        });
      }
  
      // Remove images from storage
      const imagePaths = JSON.parse(product.image || '[]');
      imagePaths.forEach(image => {
        const imagePath = path.join(__dirname, '..', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
  
      await product.destroy();
      res.status(200).json({ message: 'Product deleted successfully.' });
  
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product.' });
    }
  };
  

module.exports = { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct };

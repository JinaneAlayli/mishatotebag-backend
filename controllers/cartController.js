const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        if (!product_id || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid product or quantity.' });
        }

        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const user_id = req.user.id;
        let cartItem = await Cart.findOne({ where: { user_id, product_id } });

        const totalQuantity = cartItem ? cartItem.quantity + quantity : quantity;

        if (totalQuantity > product.stock) {
            const available = product.stock - (cartItem ? cartItem.quantity : 0);
            return res.status(400).json({
                error: `Sorry, we only have ${available > 0 ? available : 0} item(s) left in stock.`
            });
        }

        if (cartItem) {
            cartItem.quantity = totalQuantity;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({ user_id, product_id, quantity });
        }

        return res.status(200).json({ message: 'Product added to cart', cartItem });
    } catch (error) {
        console.error('Add to Cart Error:', error);
        return res.status(500).json({ error: 'Something went wrong while adding the product to the cart.' });
    }
};


exports.getCart = async (req, res) => {
    try {
        const user_id = req.user.id;
        const cartItems = await Cart.findAll({ where: { user_id } });

        return res.status(200).json(cartItems);
    } catch (error) {
        console.error('Get Cart Error:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { product_id } = req.params;
        const user_id = req.user.id;

        const cartItem = await Cart.findOne({ where: { user_id, product_id } });

        if (!cartItem) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        await cartItem.destroy();
        return res.status(200).json({ message: 'Product removed from cart' });
    } catch (error) {
        console.error('Remove from Cart Error:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const user_id = req.user.id;

        const deletedCount = await Cart.destroy({ where: { user_id } });

        return res.status(200).json({
            message: 'Cart cleared successfully',
            deletedItems: deletedCount
        });
    } catch (error) {
        console.error('Clear Cart Error:', error);
        return res.status(500).json({ error: 'Something went wrong while clearing the cart' });
    }
};



//update quantities 
exports.updateCartItem = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { quantity } = req.body;
        const user_id = req.user.id;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        const cartItem = await Cart.findOne({ where: { user_id, product_id } });
        if (!cartItem) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        // Check if product has enough stock
        const product = await Product.findByPk(product_id);
        if (product && quantity > product.stock) {
            return res.status(400).json({ 
                error: 'Not enough stock available', 
                availableStock: product.stock 
            });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        return res.status(200).json({ 
            message: 'Cart updated successfully', 
            cartItem 
        });
    } catch (error) {
        console.error('Update Cart Error:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};
//detailed cart information with product details, subtotals, and cart totals
exports.getCartWithProducts = async (req, res) => {
    try {
      const user_id = req.user.id
  
      // First, get the cart items
      const cartItems = await Cart.findAll({
        where: { user_id },
      })
  
      // Then, for each cart item, get the product details
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await Product.findByPk(item.product_id)
          return {
            ...item.toJSON(),
            Product: product ? product.toJSON() : null,
            subtotal: product ? product.price * item.quantity : 0,
          }
        }),
      )
         // Calculate total price
    const totalPrice = itemsWithProducts.reduce((sum, item) => sum + (item.subtotal || 0), 0)

    return res.status(200).json({
      items: itemsWithProducts,
      totalPrice,
      itemCount: cartItems.length,
    })
  } catch (error) {
    console.error("Get Cart with Products Error:", error)
    return res.status(500).json({ error: "Something went wrong" })
  }
}

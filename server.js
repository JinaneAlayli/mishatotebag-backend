const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const sequelize = require('./config/db'); 
const path = require('path');
const bodyParser = require("body-parser");
const contactRoutes = require("./routes/contactRoutes");
const shippingRoutes = require('./routes/shippingRoutes');

require('./models/Order'); 
require('./models/OrderItem');
// Import multer config
require('./middleware/multer.js');

const userRoutes = require('./routes/userRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes.js');

const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const app = express();

 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = [
    "http://localhost:3000",
    "https://mishatote-front-sjue.vercel.app",
    "https://mishatote-front-sjue-eqpm9tezw-rolamaaloufs-projects.vercel.app",
    "https://mishatote-front-sjue-git-main-rolamaaloufs-projects.vercel.app/",
  ];
  
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );
  


app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); 
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/contact", contactRoutes);
//app.delete('/api/cart/:product_id', CartController.removeFromCart);
//app.get('/api/cart/with-products', CartController.getCartWithProducts);

app.use('/api/shipping', shippingRoutes);


app.get('/', (req, res) => {
    res.send('Backend is Running!');
});
 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
 
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        await sequelize.sync(); 

        console.log("Database models synchronized.");
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1); 
    }
};
 


startServer();
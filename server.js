const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
require('dotenv').config();
const sequelize = require('./config/db'); 
const userRoutes = require('./routes/userRoutes'); 

const app = express();
const corsOptions = {
    origin: 'http://localhost:4001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
   
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
  
  app.use(cors(corsOptions));  // Applying CORS configuration
  
app.use(express.json());
app.use(cookieParser()); 

app.get('/', (req, res) => {
    res.send('soon!');
});
 
const startServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error(' Database connection error:', err);
        process.exit(1);
    }
};

app.use('/api/users', userRoutes);

startServer();

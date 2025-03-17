const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
 


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });
 
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "JWT_SECRET is missing in .env file!" });
        }
 
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
 
        res.cookie('token', token, {
            httpOnly: true,  
            secure: false,   
            sameSite: 'strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(200).json({ 
            msg: 'Login successful', 
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.register = async (req, res) => {
    
    try {
        const { name, email, password, role, address } = req.body;

        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4001');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            role: role || 'customer',  
            address: address || null   
        });

        res.status(201).json({ 
            msg: 'User registered successfully!', 
            user: { id: newUser.id, name, email, role: newUser.role, address: newUser.address } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




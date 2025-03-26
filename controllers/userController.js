const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

// --- Helpers ---
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
const hashPassword = (password) => password ? bcrypt.hashSync(password, 10) : null;

const updateUserFields = async (user, { name, email, newPassword, address }) => {
    if (email && email !== user.email) {
        if (!validateEmail(email)) throw new Error('Invalid email format');
        const existing = await User.findOne({ where: { email } });
        if (existing) throw new Error('This email is already in use');
    }

    if (newPassword && !validatePassword(newPassword)) {
        throw new Error('Password must be at least 6 characters long, contain 1 uppercase letter and 1 number');
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.password = newPassword ? hashPassword(newPassword) : user.password;
    user.address = address || user.address;

    await user.save();
    const { password, ...userWithoutPassword } = user.dataValues;
    return userWithoutPassword;
};

// --- Controllers ---
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, address } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

        if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
        if (!validatePassword(password)) return res.status(400).json({
            error: 'Password must be at least 6 characters long, contain at least 1 uppercase letter and 1 number'
        });

        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(409).json({ error: 'Email already exists' });

        const newUser = await User.create({
            name, email, password: hashPassword(password),
            role: role || 'customer',
            address: address || null
        });

        const { password: _, ...created } = newUser.dataValues;
        res.status(201).json({ message: 'User registered successfully!', user: created });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const user = await User.findOne({ where: { email }, attributes: ['id', 'name', 'email', 'role', 'address', 'password'] });
        if (!user) return res.status(404).json({ error: 'No account found with this email' });

        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Incorrect password' });

        if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Server config error: JWT_SECRET missing' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        const { password: _, ...userData } = user.dataValues;
        res.status(200).json({ message: 'Login successful', user: userData });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.logout = async (req, res) => {
    try {
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
        res.status(200).json({ message: 'Logout successful!' });
    } catch (err) {
        console.error('Logout Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updatedUser = await updateUserFields(user, req.body);
        res.status(200).json({ message: 'User updated successfully!', user: updatedUser });

    } catch (err) {
        console.error('Update Error:', err);
        res.status(400).json({ error: err.message || 'Something went wrong' });
    }
};

exports.updateUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updatedUser = await updateUserFields(user, req.body);
        res.status(200).json({ message: 'User updated successfully!', user: updatedUser });

    } catch (err) {
        console.error('Admin Update Error:', err);
        res.status(400).json({ error: err.message || 'Something went wrong' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'role', 'address']
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ user });
    } catch (err) {
        console.error('Get Me Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only!' });

        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'email', 'role', 'address']
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ user });
    } catch (err) {
        console.error('Get User Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'address']
        });
        res.status(200).json({ users });
    } catch (err) {
        console.error('Get Users Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const orderCount = await Order.count({ where: { user_id: id } });
        if (orderCount > 0) {
            return res.status(400).json({ error: 'Cannot delete user with existing orders' });
        }

        await User.destroy({ where: { id } });
        res.status(200).json({ message: 'User deleted successfully' });

    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
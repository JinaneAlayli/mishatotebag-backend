 

// Middleware function to protect routes by verifying JWT tokens
 
   
const jwt = require('jsonwebtoken');

//  Middleware to Protect Routes (Require Logged-In User)
exports.protect = (req, res, next) => {
    try {
        const token = req.cookies.token; 
        if (!token) return res.status(401).json({ error: 'Unauthorized, no token found' });

        req.user = jwt.verify(token, process.env.JWT_SECRET); // Store user details in request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// If you need a simpler admin check without database query
// (Use this if your JWT token already contains the role information)
exports.authorizeAdmin = (req, res, next) => {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied! Admins only.' });
    }
    next();
};

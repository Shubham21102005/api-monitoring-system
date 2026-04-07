//Used to protect the routes so they ar not accesible to unauthorized users
const jwt= require('jsonwebtoken');
const User= require('../models/User.js')

const authenticateToken= async (req,res,next)=>{
    try {
        const authHeader= req.header('Authorization');
        const token = authHeader && authHeader.split(' ')[1];
        if(!token) return res.status(401).json({message: 'Unauthorized'});

        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        const user= await User.findById(decoded.userId).select('-password');

        if(!user) return res.status(401).json({message: 'Unauthorized'});

        req.user= user;
        next();


    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
    
        res.status(500).json({ 
            message: 'Server error during authentication',
            error: error.message 
        });
    }
}

module.exports= {authenticateToken};
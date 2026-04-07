const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )
}


const register = async (req,res)=>{
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        const exists = await User.findOne({email});
        if(exists){
            return res.status(400).json({message: 'User already exists'});
        }
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password,salt)
        const user = await User.create({name,email, password: hashedPassword})
        
        const token = generateToken(user._id)

        res.status(201).json({message: 'User  created successfully', token})
    }catch(error){
        console.log(error)
        res.status(500).json({message: `Internal Server Error}`})
    }
}

const login = async (req,res) =>{
    try {
        const { email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'User doesnt exists'});
        }
        const correctPassword = await bcryptjs.compare(password, user.password)
        if(!correctPassword){
            return res.status(400).json({ message: "Incorrect Password" })
        }
        const token = generateToken(user._id)

        res.status(200).json({message: 'User  logged in successfully', token, user: {id: user._id , email: user.email}})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: `Internal Server Error`})
    }
}



module.exports = {register, login}
const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const BlacklistToken = require("../models/blacklistToken.model")


module.exports.register = async(req,res)=>{
    try {
        const {name,email,password} = req.body
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({msg:"User already exists"})
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            name,email,password:hashedPassword
        })
        await newUser.save();
        const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:"24h"})

        res.cookie('token',token)

        delete newUser._doc.password;

        return res.status(200).json({msg:"User created successfully",user:newUser, token})
    } catch (error) {
        console.log("error",error);
        return res.status(500).json({msg: error.message})
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User
            .findOne({ email })
            .select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        delete user._doc.password;

        res.cookie('token', token);

        // res.send({ token, user });

        return res.status(200).json({ msg: "User logged in successfully", user,token });

    } catch (error) {

        res.status(500).json({ message: error.message });
    }

}

module.exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        await BlacklistToken.create({ token });
        res.clearCookie('token');
        res.send({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.profile = async (req, res) => {
    try {
        res.send({ message: 'User Profile Fetch Successfully',user: req.user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

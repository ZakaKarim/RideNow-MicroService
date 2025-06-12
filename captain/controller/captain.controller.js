const Captain = require("../models/captain.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const BlacklistToken = require("../models/blacklistToken.model")
const { subscribeToQueue } = require('../service/rabbit')

const pendingRequests = [];

module.exports.register = async(req,res)=>{
    try {
        const {name,email,password} = req.body
        const captain = await Captain.findOne({email});
        if(captain){
            return res.status(400).json({msg:"Captain already exists"})
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newCaptain = Captain({
            name,email,password:hashedPassword
        })
        await newCaptain.save();
        const token = jwt.sign({id:newCaptain._id},process.env.JWT_SECRET,{expiresIn:"24h"})

        res.cookie('token',token)

        delete newCaptain._doc.password;

        return res.status(200).json({msg:"Captain created successfully",captain:newCaptain, token})
    } catch (error) {
        console.log("error",error);
        return res.status(500).json({msg: error.message})
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const captain = await Captain
            .findOne({ email })
            .select('+password');

        if (!captain) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, captain.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        delete captain._doc.password;

        res.cookie('token', token);

        // res.send({ token, user });

        return res.status(200).json({ msg: "Captain logged in successfully", captain,token });

    } catch (error) {

        res.status(500).json({ message: error.message });
    }

}

module.exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        await BlacklistToken.create({ token });
        res.clearCookie('token');
        res.send({ message: 'Captain logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.profile = async (req, res) => {
    try {
        res.send({ message: 'Captain Profile Fetch Successfully',captain: req.captain });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.toggleAvailability = async (req, res) => {
    try {
        const captain = await Captain.findById(req.captain._id);
        captain.isAvailable = !captain.isAvailable;
        await captain.save();
        res.send(captain);
    } catch (error) {

        res.status(500).json({ message: error.message });
    }
}


module.exports.waitForNewRide = async (req, res) => {
    // Set timeout for long polling (e.g., 30 seconds)
    req.setTimeout(30000, () => {
        res.status(204).end(); // No Content
    });

    // Add the response object to the pendingRequests array
    pendingRequests.push(res);
};

subscribeToQueue("new-ride", (data) => {
    const rideData = JSON.parse(data);

    // Send the new ride data to all pending requests
    pendingRequests.forEach(res => {
        res.json(rideData);
    });

    // Clear the pending requests
    pendingRequests.length = 0;
});

// subscribeToQueue("new-ride", (data) => {
//     console.log(JSON.parse(data));
// })

const Ride = require("../models/ride.model")
const { subscribeToQueue, publishToQueue } = require('../service/rabbit')


module.exports.createRide = async (req, res, next) => {

    const { pickup, destination } = req.body;


    const newRide = new Ride({
        user: req.user._id,
        pickup,
        destination
    })

    await newRide.save();
    publishToQueue("new-ride", JSON.stringify(newRide))
    res.send(newRide);
}
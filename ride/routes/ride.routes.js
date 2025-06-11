const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');
const rideController = require("../controller/ride.controller")

 router.post('/create-ride', authMiddleware.userAuth, rideController.createRide)

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require("../controller/user.controller")
const authMiddleware = require("../middleware/authMiddleWare")

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/logout', authMiddleware.userAuth, userController.logout);
router.get('/profile', authMiddleware.userAuth, userController.profile);
router.get('/accepted-ride',authMiddleware.userAuth, userController.acceptedRide);

module.exports = router;
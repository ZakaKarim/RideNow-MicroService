const express = require('express');
const router = express.Router();
const captainController = require("../controller/captain.controller")
const authMiddleware = require("../middleware/authMiddleWare")

router.post('/register', captainController.register);
router.post('/login', captainController.login);
router.get('/logout', authMiddleware.captainAuth, captainController.logout);
router.get('/profile', authMiddleware.captainAuth, captainController.profile);
router.patch('/toggle-availability', authMiddleware.captainAuth, captainController.toggleAvailability);

module.exports = router;
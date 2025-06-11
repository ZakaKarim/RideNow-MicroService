const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware')

 router.post('/create-ride', authMiddleware.userAuth)

module.exports = router;
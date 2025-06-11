const jwt = require('jsonwebtoken');
const Captain = require('../models/captain.model');
const BlacklistToken = require('../models/blacklistToken.model');


module.exports.captainAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const isBlacklisted = await BlacklistToken.find({ token });

        if (isBlacklisted.length) {
            return res.status(401).json({ message: 'Unauthorized this token is in the BlackListToken' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const captain = await Captain.findById(decoded.id);

        if (!captain) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.captain = captain;

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const BlacklistToken = require('../models/blacklistToken.model');


module.exports.userAuth = async (req, res, next) => {
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

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
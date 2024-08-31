const jwt = require('jsonwebtoken');

const authMiddleware = (role) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded;

            if (role && decoded.role !== role) {
                return res.status(403).json({ error: 'Access defined. Insufficient permissions.' });
            }
            next();
        } catch (error) {
            res.status(400).json({ error: 'Invalid token.' });
        }
    };
};

module.exports = authMiddleware;
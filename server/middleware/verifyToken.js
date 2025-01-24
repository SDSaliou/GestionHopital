const jwt = require('jsonwebtoken');


const invalidTokens = [];

module.exports = {
    verifyToken: (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '').trim();
        if (!token || invalidTokens.includes(token)) {
            return res.status(401).json({ message: 'Token invalide ou expiré.' });
        }
        // Votre logique pour vérifier le token
        next();
    },
    addInvalidToken: (token) => invalidTokens.push(token),
};




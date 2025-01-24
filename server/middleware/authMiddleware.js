const jwt = require('jsonwebtoken');

const authMiddleware =(req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Récupérer le token Bearer

    if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérification du token
        req.user = decoded; 
        
        next(); // Passe à la prochaine étape (contrôleur de la route)
    } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré' });
    }
};

module.exports = authMiddleware;

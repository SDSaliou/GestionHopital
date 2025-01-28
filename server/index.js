const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Gestion des formulaires

// Routes
app.use('/patients', require('./route/patientsRoute'));
app.use('/personnels', require('./route/personnelRoute'));
app.use('/rendezvous', require('./route/RvRoute'));
app.use('/ordonnance', require('./route/OrdonnanceRoute'));
app.use('/chambre', require('./route/ChambreRoute'));
app.use('/hospitalisation', require('./route/HospitalisationRoute'));
app.use('/dossier',require('./route/DossierRoute'));



// Route de base
app.get('/', (req, res) => {
    res.send('Serveur et MongoDB connectés !');
});

// Gestion des erreurs 404
app.use((req, res, next) => {
    res.status(404).send('Route introuvable');
});

// Middleware pour les erreurs générales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Erreur interne du serveur');
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connecté !');
        app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
    })
    .catch((err) => {
        console.error('Erreur de connexion à MongoDB :', err.message);
        process.exit(1); // Arrêter l'application en cas d'échec critique
    });

// Gestion des déconnexions MongoDB
mongoose.connection.on('disconnected', () => {
    console.error('MongoDB déconnecté ! Tentative de reconnexion...');
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Reconnexion à MongoDB réussie !'))
        .catch((err) => console.error('Erreur de reconnexion à MongoDB :', err.message));
});

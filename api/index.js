const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const port = process.env.PORT || 8080

const app = express();

// Middleware
app.use(cors({
    origin: ["https://gestion-hopital-chi.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Gestion des formulaires

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connecté !'))
    .catch((err) => console.error('Erreur de connexion à MongoDB :', err.message));


// Routes
const router = express.Router();
app.use('/patients', require('./route/patientsRoute'));
app.use('/personnels', require('./route/personnelRoute'));
app.use('/rendezvous', require('./route/RvRoute'));
app.use('/ordonnance', require('./route/OrdonnanceRoute'));
app.use('/chambre', require('./route/ChambreRoute'));
app.use('/hospitalisation', require('./route/HospitalisationRoute'));
app.use('/dossier',require('./route/DossierRoute'));



app.use('/api', router);

// Route de base
app.get('/', (req, res) => {
    res.send('Serveur et MongoDB connectés !');
});

// Gestion des erreurs 404
app.use((req, res, next) => {
    res.status(404).send('Route introuvable');
});

app.listen(port,() =>{
    `Server started on port ${port}`;
});

// Middleware pour les erreurs générales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Erreur interne du serveur');
});



// Gestion des déconnexions MongoDB
mongoose.connection.on('disconnected', () => {
    console.error('MongoDB déconnecté ! Tentative de reconnexion...');
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Reconnexion à MongoDB réussie !'))
        .catch((err) => console.error('Erreur de reconnexion à MongoDB :', err.message));
});


module.exports = app;
const express = require('express');
const jwt = require('jsonwebtoken');
const Personnels = require('../models/personnels');
const bcrypt = require('bcryptjs');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { verifyToken, addInvalidToken } = require('../middleware/verifyToken');

require('dotenv').config();


function generateToken(personnel) {
    return jwt.sign(
        { id: personnel._id, services: personnel.services },  
        process.env.JWT_SECRET, 
        { expiresIn: '3h' } 
    );
}


// Déconnexion : invalider le token
const deconnexion = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '').trim();
    if (!token) {
        return res.status(400).json({ message: 'Aucun token fourni.' });
    }

    try {
        addInvalidToken(token);
        res.status(200).json({ message: 'Vous êtes déconnecté.' });
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
//route de déconnexion
router.post('/logout', verifyToken, deconnexion);

// Route de connexion
router.post('/login', async (req, res) => {
    const { nom, password, services } = req.body;

    try {
       
        const personnel = await Personnels.findOne({ nom });

        if (!personnel) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        
        const isPasswordCorrect = await bcrypt.compare(password, personnel.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Mot de passe incorrect." });
        }

        
        if (personnel.services !== services) {
            return res.status(400).json({ message: "Le service sélectionné ne correspond pas à votre rôle." });
        }

        
        const token = generateToken(personnel);
        res.status(200).json({
            message: "Connexion réussie",
            token,
            services: personnel.services,
            id: personnel._id,
        });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Une erreur est survenue." });
    }
});



// //ajouter plusieurs
// router.post('/addMany', async (req, res) => {
//     const personnels = req.body; 

//     try {
//         if (!Array.isArray(personnels) || personnels.length === 0) {
//             return res.status(400).json({ message: 'Veuillez fournir un tableau de personnels.' });
//         }

//         // Valider chaque personnel et hacher le mot de passe
//         const personnelsToAdd = await Promise.all(personnels.map(async (personnel) => {
//             const { nom, codePersonnel, services, horaires, jourService, contact, catégories, password } = personnel;

//             if (!nom || !codePersonnel || !services || !horaires || !jourService || !contact || !catégories || !password) {
//                 throw new Error('Tous les champs sont obligatoires pour chaque personnel.');
//             }

//             const hashedPassword = await bcrypt.hash(password, 10);

//             return {
//                 nom,
//                 codePersonnel,
//                 services,
//                 horaires,
//                 jourService,
//                 contact,
//                 catégories,
//                 password: hashedPassword,
//             };
//         }));

//         // Ajouter plusieurs personnels en une seule opération
//         await Personnels.insertMany(personnelsToAdd);
//         res.status(201).json({ message: 'Personnels ajoutés avec succès.', personnels: personnelsToAdd });
//     } catch (error) {
//         res.status(500).json({ message: 'Erreur serveur', error: error.message });
//     }
// });

router.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Accès autorisé', user: req.user });
});


// Route pour ajouter un personnel
router.post('/add',  async (req, res) => {
    const { nom, codePersonnel, services, horaires, jourService, contact, catégories, password } = req.body;

    try {
        // Validation des champs obligatoires
        if (!nom || !codePersonnel || !services || !horaires || !jourService || !contact || !catégories || !password) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
        }

        // Validation du format des horaires
        if (!/^\d{2}:\d{2} - \d{2}:\d{2}$/.test(horaires)) {
            return res.status(400).json({ message: 'Les horaires doivent être au format HH:MM - HH:MM.' });
        }

        // Validation du format du numéro de contact
        if (!/^\d{8,15}$/.test(contact)) {
            return res.status(400).json({ message: 'Le numéro de téléphone doit contenir entre 8 et 15 chiffres.' });
        }

        // Vérification des doublons
        const existingPersonnel = await Personnels.findOne({ $or: [{ codePersonnel }, { contact }] });
        if (existingPersonnel) {
            return res.status(409).json({ message: 'Le code personnel ou le numéro de contact existe déjà.' });
        }

        
       
        // Création du nouveau personnel
        const newPersonnel = new Personnels({
            nom,
            codePersonnel,
            services,
            horaires,
            jourService,
            contact,
            catégories,
            password, 
        });

        await newPersonnel.save();
        res.status(201).json({ message: 'Personnel ajouté avec succès.', personnel: newPersonnel });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du personnel :', error);
        res.status(500).json({ message: 'Erreur serveur, veuillez réessayer plus tard.' });
    }
});

// Récupérer tous les médecins
router.get('/medecins', async (req, res) => {
    try {
        const medecins = await Personnels.find({ services: "Medecin" }).select('-password');
        if (!medecins) {
            return res.status(404).json({ message: 'Aucun médecin trouvé' });
        }
        res.json(medecins);
    } catch (error) {
        console.error("Erreur lors de la récupération des médecins :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// personnel ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const personnel = await Personnels.findById(req.params.id).select('-password');  // Ne jamais renvoyer le mot de passe
        if (!personnel) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json(personnel);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

  

// Route pour réinitialiser le mot de passe

router.post("/reset-password", async (req, res) => {
    const { codePersonnel, password } = req.body;

    try {
        // Rechercher le personnel par son code
        const personnel = await Personnels.findOne({ codePersonnel });
        if (!personnel) {
            return res.status(404).json({ message: "Code personnel invalide." });
        }

        // Vérification de la validité du mot de passe
        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins 6 caractères.",
            });
        }

        // Mise à jour du mot de passe (le middleware 'pre' s'exécutera automatiquement)
        personnel.password = password;
        await personnel.save();

        res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation :", error);
        res.status(500).json({ message: "Erreur serveur. Veuillez réessayer." });
    }
});







// Route pour récupérer tous les personnels avec pagination
router.get('/', async (req, res) => {

    try {
        const personnels = await Personnels.find()
            .select('-password');
        res.status(200).json(personnels);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

//update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // Vérifier si le personnel existe
    const personnel = await Personnels.findById(id);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel non trouvé." });
    }
    Object.assign(personnel, updatedData);
    await personnel.save();
    
    res.status(200).json({ message: "Personnel mis à jour avec succès.", personnel });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du personnel:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});



//delete
router.delete("/delete/:id", async (req, res) => {
    try {
      const deletedPersonnel = await Personnels.findByIdAndDelete(req.params.id);  
      if (!deletedPersonnel) {
        return res.status(404).json({ message: "personnel à supprimer non trouvé" });
      }
      res.status(200).json({ message: "Personnel supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression", error });
    }
  });


  
module.exports = router;

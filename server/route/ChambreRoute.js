const express = require("express");
const router = express.Router();
const Chambre = require("../models/chambre");

// Ajouter une chambre
router.post("/add", async (req, res) => {
    const { type, numero, capacite } = req.body;

    try {
        const newChambre = new Chambre({ type, numero, capacite });
        await newChambre.save();
        res.status(201).json({ message: "Chambre ajoutée avec succès.", chambre: newChambre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'ajout de la chambre." });
    }
});

// Modifier une chambre
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { type, numero, capacite } = req.body;

    try {
        const chambre = await Chambre.findById(id);
        if (!chambre) {
            return res.status(404).json({ message: "Chambre non trouvée." });
        }

        chambre.type = type ?? chambre.type;
        chambre.numero = numero ?? chambre.numero;
        chambre.capacite = capacite ?? chambre.capacite;

        await chambre.save();
        res.status(200).json({ message: "Chambre modifiée avec succès.", chambre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la modification de la chambre." });
    }
});

// Supprimer une chambre
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const chambre = await Chambre.findByIdAndDelete(id);
        if (!chambre) {
            return res.status(404).json({ message: "Chambre non trouvée." });
        }

        res.status(200).json({ message: "Chambre supprimée avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de la chambre." });
    }
});

// Lister toutes les chambres
router.get("/", async (req, res) => {
    try {
        const chambres = await Chambre.find().populate("patientsActuels", "patient dateEntree dateSortie");
        res.status(200).json(chambres);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des chambres." });
    }
});

// Vérifier si une chambre est disponible
router.get("/:id/disponibilite", async (req, res) => {
    const { id } = req.params;

    try {
        const chambre = await Chambre.findById(id);
        if (!chambre) {
            return res.status(404).json({ message: "Chambre non trouvée." });
        }

        const estDisponible = chambre.estDisponible();
        res.status(200).json({ disponible: estDisponible });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la vérification de la disponibilité de la chambre." });
    }
});


router.delete("/delete-all", async (req, res) => {
    try {
        // Supprimer tous les documents dans la collection Chambre
        const result = await Chambre.deleteMany({}); // Pas besoin de condition si vous supprimez tout

        res.status(200).json({
            message: "Toutes les chambres ont été supprimées avec succès",
            deletedCount: result.deletedCount, // Nombre de documents supprimés
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de toutes les chambres:", error.message);
        res.status(500).json({
            message: "Erreur lors de la suppression de toutes les chambres",
            error: error.message,
        });
    }
});

module.exports = router;

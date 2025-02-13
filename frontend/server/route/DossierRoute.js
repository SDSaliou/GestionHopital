const express = require("express");
const router = express.Router();
const Dossiers = require("../models/dossier");
const Patient = require("../models/patients");

// Ajouter un nouveau dossier
router.post("/add", async (req, res) => {
  try {
      console.log("Données reçues :", req.body);
      const dossier = new Dossiers(req.body);
      await dossier.save();
      res.status(201).json(dossier);
  } catch (err) {
      console.error("Erreur lors de l'ajout du dossier :", err.message);
      res.status(500).json({ message: "Erreur lors de l'ajout du dossier", error: err.message });
  }
});


// Récupérer le prochain numéro de dossier pour un patient donné
router.get('/nextNumero/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const lastDossier = await Dossiers.findOne({ patient: patientId }).sort({ numeroDossier: -1 });

    const nextNumeroDossier = lastDossier ? lastDossier.numeroDossier + 1 : 1;

    res.json({ numeroDossier: nextNumeroDossier });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du numéro de dossier' });
  }
});

 
// Lire tous les dossiers
router.get("/", async (req, res) => {
  try {
    const dossiers = await Dossiers.find().populate("patient", "nom dossierMedical");

    if (dossiers.length === 0) {
      return res.status(200).json({ message: "Aucun dossier trouvé" });
    }

    res.status(200).json(dossiers);
  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers:", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération des dossiers", error: error.message });
  }
});

// Lire un dossier par ID
router.get("/patient/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const dossier = await Dossiers.findOne({patient: id}).populate("patient");
    if (!dossier) {
      return res.status(404).json({ message: "Dossier non trouvé pour ce patient." });
    }
    res.status(200).json(dossier);
  } catch (error) {
    console.error("Erreur lors de la récupération du dossier:", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération du dossier", error: error.message });
  }
});

// Mettre à jour un dossier par ID
router.put("/update/:id", async (req, res) => {
  try {
    const updatedDossier = await Dossiers.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Retourner le dossier mis à jour
    );

    if (!updatedDossier) {
      return res.status(404).json({ message: "Dossier non trouvé" });
    }

    res.status(200).json({ message: "Dossier mis à jour avec succès", dossier: updatedDossier });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du dossier:", error.message);
    res.status(500).json({ message: "Erreur lors de la mise à jour du dossier", error: error.message });
  }
});

// Supprimer un dossier par ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedDossier = await Dossiers.findByIdAndDelete(req.params.id);

    if (!deletedDossier) {
      return res.status(404).json({ message: "Dossier non trouvé" });
    }

    res.status(200).json({ message: "Dossier supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du dossier:", error.message);
    res.status(500).json({ message: "Erreur lors de la suppression du dossier", error: error.message });
  }
});

module.exports = router;



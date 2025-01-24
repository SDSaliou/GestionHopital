const express = require("express");
const router = express.Router();
const Ordonnance = require("../models/Ordonnance");
const Patients = require("../models/patients");
const Personnels = require("../models/personnels");

// Lister les ordonnances d'un médecin spécifique
router.get("/", async (req, res) => {
  try {
    const ordonnances = await Ordonnance.find()
    .populate("patient","nom")
    .populate("medecin","nom");
    res.json(ordonnances);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des ordonnances", error: error.message });
  }
});

// Ajouter une nouvelle ordonnance
router.post("/add", async (req, res) => {
  const { patient, codePatient, medecin, medicaments, testsRecommandes, remarques } = req.body;

  if (!patient || !codePatient || !medecin || !medicaments || medicaments.length === 0) {
    return res.status(400).json({ message: "Les champs patient, codePatient, medecin et medicaments sont obligatoires." });
  }

  try {
    // Vérification que le patient existe
    const patientExist = await Patients.findById(patient);
    if (!patientExist) {
      return res.status(404).json({ message: "Le patient n'existe pas." });
    }

    // Vérification que le médecin existe
    const medecinExist = await Personnels.findById(medecin);
    if (!medecinExist) {
      return res.status(404).json({ message: "Le médecin n'existe pas." });
    }

    const newOrdonnance = new Ordonnance({
      patient,
      codePatient,
      medecin,
      medicaments,
      testsRecommandes,
      remarques,
    });

    const savedOrdonnance = await newOrdonnance.save();
    res.status(201).json(savedOrdonnance);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'ordonnance :", error.message);
    res.status(400).json({ message: "Erreur lors de l'ajout de l'ordonnance", error: error.message });
  }
});





// Modifier une ordonnance
router.put("/update/:id", async (req, res) => {
  try {
    const updatedOrdonnance = await Ordonnance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedOrdonnance) {
      return res.status(404).json({ message: "Ordonnance non trouvée" });
    }
    res.status(200).json(updatedOrdonnance);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordonnance :", error.message);
    res.status(400).json({ message: "Erreur lors de la mise à jour de l'ordonnance", error: error.message });
  }
});

// Supprimer une ordonnance
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedOrdonnance = await Ordonnance.findByIdAndDelete(req.params.id);
    if (!deletedOrdonnance) {
      return res.status(404).json({ message: "Ordonnance non trouvée" });
    }
    res.status(200).json({ message: "Ordonnance supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'ordonnance :", error.message);
    res.status(500).json({ message: "Erreur lors de la suppression de l'ordonnance", error: error.message });
  }
});




module.exports = router;

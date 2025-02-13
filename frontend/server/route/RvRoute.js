const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const RendezVous = require("../models/Rv");
const Patients = require("../models/patients");
const Personnels = require("../models/personnels");

// Route pour récupérer tous les rendez-vous
router.get("/", async (req, res) => {
  try {
    const rendezvous = await RendezVous.find()
      .populate("patient", "nom _id")
      .populate("medecin", "nom _id");

    res.status(200).json(rendezvous);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des rendez-vous." });
  }
});

// Route pour récupérer les rendez-vous d'un médecin spécifique
router.get("/med", async (req, res) => {
  const { medecinId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(medecinId)) {
    return res.status(400).json({ error: "L'identifiant du médecin est invalide." });
  }

  try {
    const rendezvous = await RendezVous.find({ medecin: medecinId })
      .populate("patient", "nom _id")
      .populate("medecin", "nom _id");

    res.status(200).json(rendezvous);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des rendez-vous." });
  }
});

// Ajouter un rendez-vous
router.post("/add", async (req, res) => {
  const { patient, date, heure, medecin } = req.body;

  // Validation des champs
  if (!patient || !date || !heure || !medecin) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  // Vérification des identifiants
  if (!mongoose.Types.ObjectId.isValid(patient) || !mongoose.Types.ObjectId.isValid(medecin)) {
    return res.status(400).json({ message: "Identifiant patient ou médecin invalide." });
  }

  try {
    const patientExists = await Patients.findById(patient);
    const médecinExists = await Personnels.findById(medecin);

    if (!patientExists || !médecinExists) {
      return res.status(404).json({ message: "Patient ou médecin non trouvé." });
    }

    // Validation des horaires
    const horaires = médecinExists.horaires.split(" - ");
    const [startHour, startMin] = horaires[0].split(":").map(Number);
    const [endHour, endMin] = horaires[1].split(":").map(Number);

    const apTime = new Date(`1970-01-01T${heure}:00`);
    const startTime = new Date(`1970-01-01T${startHour}:${startMin}:00`);
    const endTime = new Date(`1970-01-01T${endHour}:${endMin}:00`);

    if (apTime < startTime || apTime > endTime) {
      return res.status(400).json({ message: "L'heure du rendez-vous est hors des horaires du médecin." });
    }

    // Vérification des doublons
    const existingRV = await RendezVous.findOne({ patient, medecin, date, heure });
    if (existingRV) {
      return res.status(409).json({ message: "Un rendez-vous existe déjà à cette date et heure." });
    }

    const newRendezVous = new RendezVous({ patient, date, heure, medecin });
    await newRendezVous.save();

    res.status(201).json(newRendezVous);
  } catch (error) {
    console.error("Erreur lors de l'ajout du rendez-vous :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// Mettre à jour un rendez-vous
router.put("/update/:id", async (req, res) => {
  const { patient, date, heure, medecin } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Identifiant du rendez-vous invalide." });
  }

  try {
    const patientExists = await Patients.findById(patient);
    const médecinExists = await Personnels.findById(medecin);

    if (!patientExists || !médecinExists) {
      return res.status(404).json({ message: "Patient ou médecin non trouvé." });
    }

    const updatedRendezVous = await RendezVous.findByIdAndUpdate(
      req.params.id,
      { patient, date, heure, medecin },
      { new: true }
    );

    if (!updatedRendezVous) {
      return res.status(404).json({ message: "Rendez-vous non trouvé." });
    }

    res.json(updatedRendezVous);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du rendez-vous." });
  }
});

// Supprimer un rendez-vous
router.delete("/delete/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Identifiant du rendez-vous invalide." });
  }

  try {
    const deletedRendezVous = await RendezVous.findByIdAndDelete(req.params.id);

    if (!deletedRendezVous) {
      return res.status(404).json({ message: "Rendez-vous non trouvé." });
    }

    res.status(200).json({ message: "Rendez-vous supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la suppression du rendez-vous." });
  }
});

module.exports = router;

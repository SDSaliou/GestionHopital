const express = require('express');
const Patient = require('../models/patients');
const router = express.Router();  

// Lister tous les patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ajouter un patient
router.post('/Add', async (req, res) => {
    const { nom, codePatient, numAssuranceMaladie, numTelephone, dateEntree,dossierMedical } = req.body;
    const newPatient = new Patient({
        nom,
        codePatient,
        numAssuranceMaladie,
        numTelephone,
        dateEntree,
        dossierMedical
    });

    try {
        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Modifier un patient
router.put('/:_id', async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(req.params._id, req.body, { new: true });
        res.json(updatedPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rechercher un patient par nom, code, numéro assurance maladie ou numéro de téléphone
router.get('/search', async (req, res) => {
    const { nom, codePatient, numAssuranceMaladie, numTelephone } = req.query;

    try {
        const patient = await Patient.findOne({
            $or: [
                { nom },
                { codePatient },
                { numAssuranceMaladie },
                { numTelephone }
            ]
        });
        if (!patient) return res.status(404).json({ message: "Patient non trouvé" });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//delete
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    console.log("ID reçu pour suppression:", id);  
    try {
      const deletedPatient = await Patient.findByIdAndDelete(id);  
      if (!deletedPatient) {
        return res.status(404).json({ message: "Patient non trouvé" });
      }
      res.status(200).json({ message: "Patient supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression", error });
    }
  });
  



module.exports = router; 

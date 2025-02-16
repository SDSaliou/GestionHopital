const express = require("express");
const router = express.Router();
const Hospitalisation = require("../models/hospitalisation");
const Chambre = require("../models/chambre");
const Patients = require("../models/patients");
// Ajouter une hospitalisation
router.post("/add", async (req, res) => {
    const { patient, chambre , dateEntree, notes } = req.body;
    
    if(!patient || !chambre || !dateEntree  || !notes) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires."});
    }

    try {
      //vérification si le patient existe
      const patientExist = await Patients.findById(patient);
      if (!patientExist) {
        return res.status(404).json({ message: "Le patient n'existe pas." });
      }
        // Vérifier si la chambre existe et est disponible
        const chambreExist = await Chambre.findById(chambre);

        if (!chambreExist) {
            return res.status(404).json({ message: "Chambre introuvable." });
        }

        if (!chambreExist.estDisponible()) {
            return res.status(400).json({ message: "Chambre pleine. Veuillez choisir une autre chambre." });
        }

        // Ajouter une hospitalisation
        const newHospitalisation = new Hospitalisation({
            patient,
            chambre: chambreExist._id,
            dateEntree,
            notes,
        });

        await newHospitalisation.save();

        // Mettre à jour les occupants actuels de la chambre
        chambreExist.patientsActuels.push(newHospitalisation._id);
        await chambreExist.save();

        res.status(201).json({ message: "Hospitalisation ajoutée avec succès.", hospitalisation: newHospitalisation });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'hospitalisation:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});

// Modifier une hospitalisation
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { patient,dateEntree,chambre, dateSortie, notes } = req.body;

    try {
        const hospitalisation = await Hospitalisation.findById(id);

        if (!hospitalisation) {
            return res.status(404).json({ message: "Hospitalisation non trouvée." });
        }

        if (chambre && chambre !== hospitalisation.chambre?.toString()) {
            console.log("Nouvelle chambre ID :", chambre);
            const nouvelleChambre = await Chambre.findById(chambre);
            if (!nouvelleChambre) {
                return res.status(404).json({ message: "Nouvelle chambre introuvable." });
            }

            if (!nouvelleChambre.estDisponible()) {
                return res.status(400).json({ message: "Nouvelle chambre pleine." });
            }

            // Retirer le patient de l'ancienne chambre
            const ancienneChambre = await Chambre.findById(hospitalisation.chambre);
            if (ancienneChambre) {
                ancienneChambre.patientsActuels = ancienneChambre.patientsActuels.filter(
                    (hospId) => hospId.toString() !== id
                );
                await ancienneChambre.save();
            }

            // Ajouter le patient à la nouvelle chambre
            nouvelleChambre.patientsActuels.push(id);
            await nouvelleChambre.save();

            hospitalisation.chambre = chambre;
        } else {
            console.log("Aucune modification de la chambre.");
        }

        if(patient) hospitalisation.patient = patient;
        if(dateEntree) hospitalisation.dateEntree = dateEntree;
        if (dateSortie) hospitalisation.dateSortie = dateSortie;
        if (notes) hospitalisation.notes = notes;

        await hospitalisation.save();

        res.status(200).json({ message: "Hospitalisation mise à jour avec succès.", hospitalisation });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'hospitalisation:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});

// Lister toutes les hospitalisations
router.get("/", async (req, res) => {
    try {
        const hospitalisations = await Hospitalisation.find()
            .populate("patient", "nom codePatient dossierMedical")
            .populate("chambre", "type numero");

        res.status(200).json(hospitalisations);
    } catch (error) {
        console.error("Erreur lors de la récupération des hospitalisations:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});

// Récupérer une hospitalisation spécifique
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const hospitalisation = await Hospitalisation.findById(id)
            .populate("patient", "nom codePatient dossierMedical")
            .populate("chambre", "type numero");

        if (!hospitalisation) {
            return res.status(404).json({ message: "Hospitalisation non trouvée." });
        }

        res.status(200).json(hospitalisation);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'hospitalisation:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});

module.exports = router;

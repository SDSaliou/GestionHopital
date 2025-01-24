const mongoose = require("mongoose");
const Patient = require("../models/patients");

// Schéma pour le dossier
const dossierSchema = new mongoose.Schema({
  numeroDossier: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patients", required: true },
  diagnostic: { type: [
    {
      note: { type: String , required: true },
      indication: {type: String , required: true },
      tests: {
        type: [String ],
        validate: {
          validator: (v) => Array.isArray(v),
          message: "Le champ tests doit être un tableau de chaînes.",
        },},
      type: { 
        type: String,
        enum: ['Consultation', 'Intervention', 'Suivi'], 
        required: true  },
      traitement:{type: String},
      DateDiagnostic: { type: Date }
    },
  ], validate: {
      validator: (v) => v.length > 0,
      message: "Le champ  doit contenir au moins un diagnostic",
  }, },
});

// Middleware `pre` pour attribuer un `numeroDossier` unique avant d'enregistrer
dossierSchema.pre("save", async function (next) {
  if (!this.numeroDossier) {
    try {
      const patient = await Patient.findById(this.patient);

      if (!patient) {
        return next(new Error("Patient introuvable"));
      }
      
      next();
    } catch (err) {
      console.error("Erreur lors de l'attribution de numeroDossier :", err);
      next(err);
    }
  } else {
    next();
  }
});

//pour associer automatiquement le dossier au patient
dossierSchema.post("save", async function (dossier) {
  try {
    const patient = await Patient.findByIdAndUpdate(dossier.patient, {
      dossierMedical: dossier.numeroDossier
    });
    if (!patient) {
      throw new Error(`Patient avec l'ID ${dossier.patient} introuvable`);
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour du patient :", err.message);
  }
});

const Dossiers = mongoose.model("Dossiers", dossierSchema);
module.exports = Dossiers;
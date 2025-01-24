const mongoose = require('mongoose');
const Patients = require("./patients");
const Personnels =require("./personnels");


const ordonnanceSchema = new mongoose.Schema({
 
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patients",
    required: [true, "Le champ patient est obligatoire"],
  },
  codePatient: {
    type: String,
    required: [true, "Le code patient est obligatoire"],
    unique: true,
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Personnels",
    required: [true, "Le champ medecin est obligatoire"],
  },
  datePrescription: {
    type: Date,
    default: Date.now,
  },
  medicaments: {
    type: [
      {
        nom: { type: String, required: true },
        posologie: { type: String, required: true },
        duree: { type: String, required: true },
      },
    ],
    validate: {
      validator: (v) => v.length > 0,
      message: "Le champ medicaments doit contenir au moins un médicament.",
    },
  },
  testsRecommandes: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v),
      message: "Le champ testsRecommandes doit être un tableau de chaînes.",
    },
  },
  remarques: {
    type: String,
  },
});


const Ordonnance = mongoose.model("Ordonnance", ordonnanceSchema);
module.exports = Ordonnance;


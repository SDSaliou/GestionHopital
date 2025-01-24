const mongoose = require('mongoose');
const Patients = require("./patients");
const Personnels =require("./personnels");

const rendezVousSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patients', required: true },
    date: { type: Date, required: true },
    heure: { type: String, required: true },
    medecin: { type: mongoose.Schema.Types.ObjectId, ref: 'Personnels', required: true }  
});

const RendezVous = mongoose.model('RendezVous', rendezVousSchema);

module.exports = RendezVous;

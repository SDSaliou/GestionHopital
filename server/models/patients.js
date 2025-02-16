
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    nom:{ type: String, required: true},
    codePatient: { type: String, required:true, unique: true},
    numAssuranceMaladie: { type:String, required: true},
    numTelephone: {type: Number, required: true},
    dateEntree: { type: Date, default: Date.now },
    dossierMedical: {type: String}
});

patientSchema.pre('save', function (next) {
    if (!this.dossierMedical) {
      this.dossierMedical = `D${this.codePatient}`;
    }
    next();
  });
  

const Patient = mongoose.model ('Patients', patientSchema);

module.exports = Patient;
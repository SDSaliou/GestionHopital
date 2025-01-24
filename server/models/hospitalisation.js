const mongoose = require("mongoose");
const Patients= require("./patients");
const Chambre = require("./chambre");

const HospitalisationSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patients",
        required: true,
    },
    dateEntree: {
        type: Date,
        required: true,
    },
    dateSortie: {
        type: Date,
        default: null,
    },
    chambre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chambre",
        required: true,
    },
    notes: {
        type: String,
        default: "",
    },
});

const Hospitalisation = mongoose.model("Hospitalisation", HospitalisationSchema);

module.exports = Hospitalisation;

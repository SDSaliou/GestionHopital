const mongoose = require("mongoose");

const ChambreSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Cabinet", "Normal"],
        required: true,
    },
    numero: {
        type: String,
        unique: true,
        required: true,
    },
    capacite: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return (this.type === "Cabinet" && value === 1) || (this.type === "Normal" && value >= 1 && value <= 3);
            },
            message: "Capacité invalide pour le type de chambre.",
        },
    },
    patientsActuels: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospitalisation",
        },
    ],
});

ChambreSchema.methods.estDisponible = function () {
    return this.patientsActuels.length < this.capacite;
};

const Chambre = mongoose.model("Chambre", ChambreSchema);

module.exports = Chambre;

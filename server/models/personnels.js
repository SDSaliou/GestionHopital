const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');


const personnelSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    codePersonnel: { type: String, required: true, unique: true },
    services: { type: String, enum: ["Admin", "Medecin", "Labo", "Receptionniste","Comptable","Sécurité","Infirmier", "Néttoyage"], required: true },
    horaires: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{2}:\d{2} - \d{2}:\d{2}$/.test(value);
        },
        message: "Le format des horaires doit être 'HH:MM - HH:MM'.",
      },
    },
    contact: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{8,15}$/.test(value);
        },
        message: "Le numéro de contact doit contenir entre 8 et 15 chiffres.",
      },
    },
    catégories: { type: String, enum: ["Soignant", "Non Soignant"], required: true },
    jourService: {
      type: [String],
      enum: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
      required: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// // Méthode pour comparer les mots de passe
// personnelSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// // Méthode pour générer un token JWT
// personnelSchema.methods.generateAuthToken = function () {
//   return jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
//     expiresIn: "1h",
//   });
// };

// Middleware pour hacher le mot de passe avant sauvegarde
personnelSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode statique pour récupérer les médecins
personnelSchema.statics.findMedecins = function () {
  return this.find({ services: "Medecin" });
};

// Gérer les erreurs uniques
personnelSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("Le code personnel existe déjà."));
  } else {
    next(error);
  }
});


const Personnels = mongoose.model("Personnels", personnelSchema);

module.exports = Personnels;

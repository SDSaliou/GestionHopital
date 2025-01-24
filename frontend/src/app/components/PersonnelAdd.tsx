"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PersonnelProps {
  fetchPersonnel: () => void;
}

const Personnel: React.FC<PersonnelProps> = ({ fetchPersonnel }) => {
  const [personnels, setPersonnels] = useState({
    nom: "",
    codePersonnel: "",
    services: "",
    horaires: "",
    jourService: [] as string[],
    contact: "",
    catégories: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  

    const validateForm = () => {
      const { nom, codePersonnel, services, horaires, jourService, contact, catégories, password } =
        personnels;
  
      if (!nom.trim() || !codePersonnel.trim() || !services || !horaires.trim() || jourService.length === 0 || !contact.trim() || !catégories || !password) {
        toast.error("Veuillez remplir tous les champs.");
        return false;
      }
  
      // Horaires validation (HH:MM - HH:MM)
      if (!/^\d{2}:\d{2} - \d{2}:\d{2}$/.test(horaires)) {
        toast.error("Les horaires doivent être au format HH:MM - HH:MM.");
        return false;
      }
  
      // Téléphone validation (8 à 15 chiffres)
      if (!/^\d{8,15}$/.test(contact)) {
        toast.error("Le numéro de téléphone doit contenir entre 8 et 15 chiffres.");
        return false;
      }
  
      return true;
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/personnels/add", { ...personnels });
      toast.success("Personnel ajouté avec succès.");
      fetchPersonnel();

      setPersonnels({
        nom: "",
        codePersonnel: "",
        services: "",
        horaires: "",
        jourService: [],
        contact: "",
        catégories: "",
        password: "",
      });

     
    } catch (error: unknown) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as { message: string })?.message ||
        "Une erreur est survenue lors de l'ajout.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof personnels, value: string | string[]) => {
    setPersonnels((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white max-w-3xl mx-auto p-8 rounded-lg shadow-lg">
      <h2 className="text-xl text-center font-bold mb-6">Ajouter un Personnel</h2>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={personnels.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            type="text"
            placeholder="Entrez le nom"
            required
          />
        </div>

        {/* Code Personnel */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Code Personnel</label>
          <input
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={personnels.codePersonnel}
            onChange={(e) => handleChange("codePersonnel", e.target.value)}
            type="text"
            placeholder="Entrez le code personnel"
            required
          />
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Services</label>
          <select
            value={personnels.services}
            onChange={(e) => handleChange("services", e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>
              Sélectionnez un service
            </option>
            <option value="Admin">Admin</option>
            <option value="Receptionniste">Réceptionniste</option>
            <option value="Labo">Labo</option>
            <option value="Medecin">Médecin</option>
            <option value="Comptable">Comptable</option>
            <option value="Sécurité">Sécurité</option>
          </select>
        </div>

        {/* Horaires */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Horaires</label>
          <input
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={personnels.horaires}
            onChange={(e) => handleChange("horaires", e.target.value)}
            type="text"
            placeholder="08:00 - 17:00"
            pattern="^\d{2}:\d{2} - \d{2}:\d{2}$"
            required
          />
        </div>

        {/* Jours de Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Jours de Service</label>
          <ul className="grid grid-cols-2 gap-4">
            {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((jour) => (
              <li key={jour} className="flex items-center">
                <input
                  type="checkbox"
                  value={jour}
                  checked={personnels.jourService.includes(jour)}
                  onChange={(e) =>
                    handleChange(
                      "jourService",
                      personnels.jourService.includes(jour)
                        ? personnels.jourService.filter((d) => d !== jour)
                        : [...personnels.jourService, jour]
                    )
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2">{jour}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={personnels.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
            type="text"
            placeholder="Entrez le numéro"
            required
          />
        </div>

        {/* Catégories */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégories</label>
          <select
            value={personnels.catégories}
            onChange={(e) => handleChange("catégories", e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>
              Sélectionnez une catégorie
            </option>
            <option value="Soignant">Soignant</option>
            <option value="Non Soignant">Non Soignant</option>
          </select>
        </div>

        {/* Mot de Passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de Passe</label>
          <input
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={personnels.password}
            onChange={(e) => handleChange("password", e.target.value)}
            type="password"
            placeholder="Entrez un mot de passe"
            required
          />
        </div>

        {/* Bouton de soumission */}
        <button
          disabled={loading}
          className={`w-full py-2 px-4 font-semibold rounded-md ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          type="submit"
        >
          {loading ? "En cours..." : "Ajouter"}
        </button>
      </form>
    </div>
  );
};

export default Personnel;

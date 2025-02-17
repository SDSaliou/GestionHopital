"use client";

import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Patient {
  _id: string;
  nom: string;
}

interface Medecin {
  _id: string;
  nom: string;
  horaires: string;
  jourService: string[];
}

interface RVProps {
  fetchRV: () => void;
}

const RV: React.FC<RVProps> = ({ fetchRV }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [selectedMedecin, setSelectedMedecin] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [heure, setTime] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const isFormValid =
    selectedMedecin && selectedPatient && date && heure && selectedDay;

  // Récupérer les patients
  const fetchPatients = async () => {
    try {
      const  resPatient  = await axios.get<Patient[]>("http://gestion-hopital-api.vercel.app/patients");
      const sortedPatients = resPatient.data
      .sort((a, b) => a.nom.localeCompare(b.nom));
      setPatients(sortedPatients);
    } catch (error) {
      console.error("Erreur lors de la récupération des patients :", error);
      toast.error("Erreur lors de la récupération des patients.");
    }
  };

  // Récupérer les médecins
  const fetchMedecins = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<Medecin[]>("http://gestion-hopital-api.vercel.app/personnels/medecins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const medOr = data
      .sort((a,b) => a.nom.localeCompare(b.nom));
      setMedecins(medOr);
    } catch (error) {
      const errorResponse = error as AxiosError;
      toast.error((errorResponse.response?.data as { message: string })?.message || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    
    }
  };
  useEffect(() => {
    fetchPatients();
    fetchMedecins();
  }, []);

  // Filtrer les médecins disponibles pour le jour sélectionné
  const filteredMedecins = medecins.filter((medecin) =>
    medecin.jourService.includes(selectedDay)
  );

  // Vérifier si l'heure sélectionnée est valide pour le médecin
  const isValidTime = (medecin: Medecin) => {
    const [DebutH, DebutMin] = medecin.horaires.split(" - ")[0].split(":").map(Number);
    const [FinH, FinMin] = medecin.horaires.split(" - ")[1].split(":").map(Number);

    const [selectedH, selectedMin] = heure.split(":").map(Number);
    const isValidTime = selectedH > DebutH || (selectedH === DebutH && selectedMin >= DebutMin);
    const isValidEndTime = selectedH < FinH || (selectedH === FinH && selectedMin <= FinMin);

    return isValidTime && isValidEndTime;
  };

  const handleAddRV = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const selectedDateTime = new Date(`${date}T${heure}`);
    if (selectedDateTime <= new Date()) {
      toast.error("La date et l'heure ne peuvent pas être dans le passé.");
      return;
    }

    const medecin = filteredMedecins.find((m) => m._id === selectedMedecin);
    if (!medecin || !isValidTime(medecin)) {
      toast.error("L'heure choisie n'est pas valide pour ce médecin.");
      return;
    }

    const selectedDay = selectedDateTime.toLocaleString("fr-FR", { weekday: "long" }).toLowerCase();
    if (!medecin.jourService.some((jour) => jour.toLowerCase() === selectedDay)) {
      toast.error(`Le médecin n'est pas disponible le ${selectedDay}. Disponible uniquement les jours suivants : ${medecin.jourService.join(", ")}.`);
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://gestion-hopital-api.vercel.app/rendezvous/add", {
        medecin: selectedMedecin,
        patient: selectedPatient,
        date,
        heure,
      });
      toast.success("Rendez-vous ajouté avec succès !");
      setSelectedMedecin("");
      setSelectedPatient("");
      setDate("");
      setTime("");
      fetchRV();
    } catch (error) {
      console.error("Erreur lors de l'ajout du rendez-vous :", error);
      toast.error("Erreur lors de l'ajout du rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Donner un Rendez-vous</h2>
      <ToastContainer />
      <form onSubmit={handleAddRV}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Jour</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Sélectionnez un jour</option>
            {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((jour) => (
              <option key={jour} value={jour}>
                {jour}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Médecin</label>
          <select
            value={selectedMedecin}
            onChange={(e) => setSelectedMedecin(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Sélectionnez un médecin</option>
            {filteredMedecins.map((medecin) => (
              <option key={medecin._id} value={medecin._id}>
                {medecin.nom} - {medecin.horaires}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Patient</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Sélectionnez un patient</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Heure</label>
          <input
            type="time"
            value={heure}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 text-white rounded-md shadow-md ${
            isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!isFormValid || loading}
        >
          {loading ? "Chargement..." : "Ajouter"}
        </button>
      </form>
    </div>
  );
};

export default RV;

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { FiEye, FiEdit, FiDownload } from "react-icons/fi";

interface Medicament {
  nom: string;
  posologie: string;
  duree: string;
}

interface Ordonnance {
  _id: string;
  patient: { nom: string } | null;
  codePatient: string;
  medecin: { nom: string } | null;
  datePrescription: string;
  medicaments: Medicament[];
  testsRecommandes: string[];
  remarques?: string;
}


interface OrdonnanceListProps {
  ordonnances: Ordonnance[];
  fetchOrdonnances: () => void;
}

const OrdonnanceList: React.FC<OrdonnanceListProps> = ({ ordonnances, fetchOrdonnances }) => {
  const [selectedOrdonnance, setSelectedOrdonnance] = useState<Ordonnance | null>(null);
  const [modifier, setModifier] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrdonnances = async () => {
      try {
        const res = await axios.get("http://localhost:5000/ordonnance/");
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des ordonnances.");
        setLoading(false);
      }
    };
    fetchOrdonnances();
  }, []);

  const generatePDF = (ordonnance: Ordonnance) => {
    const doc = new jsPDF();

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    doc.text("Ordonnance Médicale", 105, 10, { align: "center" });
    doc.line(10, 15, 200, 15);

    const rightMargin=200;
    doc.text(`Patient : ${ordonnance.patient?.nom || "Inconnu"} `, rightMargin,20,{align:"right"});
    doc.text(`Médecin : ${ordonnance.medecin?.nom || "Inconnu"} `, rightMargin,30,{align:"right"})
    doc.text(`Date de prescription : ${new Date(ordonnance.datePrescription).toLocaleDateString()}`, 10, 45);

    doc.text("Médicaments :", 10, 55);
    ordonnance.medicaments.forEach((med, index) => {
      doc.text(`${index + 1}. ${med.nom} - ${med.posologie} - ${med.duree}`, 15, 65 + index * 10);
    });

    doc.text("Tests recommandés :", 10, 85);
    ordonnance.testsRecommandes.forEach((test, index) => {
      doc.text(`${index + 1}. ${test}`, 15, 95 + index * 10);
    });

    if (ordonnance.remarques) {
      doc.text("Remarques :", 10, 115);
      doc.text(ordonnance.remarques, 15, 125);
    }

    doc.save(`Ordonnance_${ordonnance.patient?.nom}_${ordonnance._id}.pdf`);
  };

  const handleSaveModifier = async (updatedOrdonnance: Ordonnance) => {
    try {
      await axios.put(`http://localhost:5000/ordonnance/update/${updatedOrdonnance._id}`, updatedOrdonnance);
      setModifier(false);
      setSelectedOrdonnance(updatedOrdonnance);
      fetchOrdonnances();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des modifications.", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Liste des Ordonnances</h1>

    {/* Formulaire de mise à jour */}
    {modifier && selectedOrdonnance && (
        <div className="mt-6 border p-4 rounded shadow-md bg-gray-100">
        <h3 className="text-lg font-semibold">Modifier l'Ordonnance</h3>
      
        {/* Médicaments */}
        <h3 className="mt-4 text-lg font-semibold">Médicaments: </h3>
          <ul className="list-disc pl-6">
            {selectedOrdonnance.medicaments.map((med, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={med.nom}
                  onChange={(e) => {
                    const updatedMed = [...selectedOrdonnance.medicaments];
                    updatedMed[idx].nom = e.target.value;
                    setSelectedOrdonnance({ ...selectedOrdonnance, medicaments: updatedMed });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <input
                  type="text"
                  value={med.posologie}
                  onChange={(e) => {
                    const updatedMed = [...selectedOrdonnance.medicaments];
                    updatedMed[idx].posologie = e.target.value;
                    setSelectedOrdonnance({ ...selectedOrdonnance, medicaments: updatedMed });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <input
                  type="text"
                  value={med.duree}
                  onChange={(e) => {
                    const updatedMed = [...selectedOrdonnance.medicaments];
                    updatedMed[idx].duree = e.target.value;
                    setSelectedOrdonnance({ ...selectedOrdonnance, medicaments: updatedMed });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <button
                  onClick={() => {
                    const updatedMed = selectedOrdonnance.medicaments.filter((_, index) => index !== idx);
                    setSelectedOrdonnance({ ...selectedOrdonnance, medicaments: updatedMed });
                  }}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              setSelectedOrdonnance({
                ...selectedOrdonnance,
                medicaments: [...selectedOrdonnance.medicaments, { nom: "", posologie: "", duree: "" }],
              })
            }
            className="mt-2 bg-green-500 text-white py-2 px-4 rounded"
          >
            Ajouter un medicament
          </button>
        {/* Tests Recommandés */}
        <h3 className="mt-4 text-lg font-semibold">Tests Recommandés :</h3>
        <ul className="list-disc pl-6">
          {selectedOrdonnance.testsRecommandes.map((test, idx) => (
            <li key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                value={test}
                onChange={(e) => {
                  const updatedTests = [...selectedOrdonnance.testsRecommandes];
                  updatedTests[idx] = e.target.value;
                  setSelectedOrdonnance({ ...selectedOrdonnance, testsRecommandes: updatedTests });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              <button
                onClick={() => {
                  const updatedTests = selectedOrdonnance.testsRecommandes.filter((_, index) => index !== idx);
                  setSelectedOrdonnance({ ...selectedOrdonnance, testsRecommandes: updatedTests });
                }}
                className="bg-red-500 text-white py-1 px-2 rounded"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() =>
            setSelectedOrdonnance({
              ...selectedOrdonnance,
              testsRecommandes: [...selectedOrdonnance.testsRecommandes, ""], // Ajouter un test vide
            })
          }
          className="mt-2 bg-green-500 text-white py-2 px-4 rounded"
        >
          Ajouter un Test
        </button>
    
        {/* Remarques */}
        {selectedOrdonnance.remarques && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Remarques</label>
            <textarea
              value={selectedOrdonnance.remarques}
              onChange={(e) =>
                setSelectedOrdonnance({ ...selectedOrdonnance, remarques: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}
    
        {/* Boutons Sauvegarder et Annuler */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => handleSaveModifier(selectedOrdonnance)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
          >
            Sauvegarder
          </button>
          <button
            onClick={() => setModifier(false) }
            className="ml-4 px-6 py-2 bg-gray-300 text-gray-700 rounded-md shadow-md hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    )}

      {!modifier && selectedOrdonnance && (
            <div className="mt-6 border p-4 rounded shadow-md bg-gray-100">
              <h2 className="text-xl font-bold">Détails de l'Ordonnance</h2>
              <p>
                <strong>Patient :</strong> {selectedOrdonnance.patient?.nom || "Inconnu"}
              </p>
              <p>
                <strong>codePatient :</strong> {selectedOrdonnance.codePatient}
              </p>
              <p>
                <strong>Médecin :</strong> {selectedOrdonnance.medecin?.nom || "Inconnu"}
              </p>
              <p>
                <strong>Date :</strong> {new Date(selectedOrdonnance.datePrescription).toLocaleDateString()}
              </p>
              <h3 className="mt-4 text-lg font-semibold">Médicaments :</h3>
              <ul className="list-disc pl-6">
                {selectedOrdonnance.medicaments.map((med, idx) => (
                  <li key={idx}>
                    {med.nom} - {med.posologie} - {med.duree}
                  </li>
                ))}
              </ul>
              <h3 className="mt-4 text-lg font-semibold">Tests Recommandés :</h3>
              <ul className="list-disc pl-6">
                {selectedOrdonnance.testsRecommandes.map((test, idx) => (
                  <li key={idx}>{test}</li>
                ))}
              </ul>
              {selectedOrdonnance.remarques && (
                <p className="mt-4">
                  <strong>Remarques :</strong> {selectedOrdonnance.remarques}
                </p>
              )}
              <button
                className="bg-red-500 text-white py-2 px-4 rounded mt-2"
                onClick={() => setSelectedOrdonnance(null)}
              >
                Fermer
              </button>
            </div>
            )} 
      {loading && <p>Chargement des ordonnances...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
      {ordonnances.map((ordonnance) => (
        <div key={ordonnance._id} className="border p-4 rounded shadow-md">
          <p>
            <strong>Patient :</strong> {ordonnance.patient?.nom || "Inconnu"}
          </p>
          <p>
            <strong>Code Patient :</strong> {ordonnance.codePatient}
          </p>
          <p>
            <strong>Médecin :</strong> {ordonnance.medecin?.nom || "Inconnu"}
          </p>
          <p>
            <strong>Date :</strong> {new Date(ordonnance.datePrescription).toLocaleDateString()}
          </p>
          <div className="mt-2 flex space-x-2">
          {/* Voir */}
          <button
            className="flex items-center bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => setSelectedOrdonnance(ordonnance)}
          >
            <FiEye className="mr-2" />
          </button>
            
            {/* Télécharger */}
          <button
            className="flex items-center bg-green-500 text-white py-2 px-4 rounded"
            onClick={() => generatePDF(ordonnance)}
          >
            <FiDownload className="mr-2" /> 
          </button>
            {/* Modifier */}
          <button
            className="flex items-center bg-yellow-500 text-white py-2 px-4 rounded"
            onClick={() => {
              setSelectedOrdonnance(ordonnance);
              setModifier(true);
            }}
          >
            <FiEdit className="mr-2" /> 
          </button>
          </div>
        </div>
      ))}
      </div>
    )}

  </div>
)}   

      
export default OrdonnanceList;

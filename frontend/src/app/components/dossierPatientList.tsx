"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Diagnostics {
    note: string;
    indication:string;
    tests:string[];
    type :string;
    traitement: string;
    DateDiagnostic: string;
}

interface Dossier {
  _id: string;
  patient: { nom: string, dossierMedical: string} | null; 
  diagnostic: Diagnostics[];
  numeroDossier?: string; 
}


interface DossierListProps {
    dossierPatient: Dossier[];
    fetchDoPatient: () => void;
}

const dossierList: React.FC<DossierListProps> = ({dossierPatient, fetchDoPatient}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [modifier, setModifier] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dossierPage = 5;
  
  useEffect(() => {
    const fetchDossPatient = async () => {
        try {
          const res = await axios.get('http://localhost:5000/dossier/');
          fetchDoPatient();
          setLoading(false);
        } catch (error) {
          console.error('Error fetching dossiers:', error);
          toast.error('Erreur lors de la récupération des dossiers');
          setLoading(false);
          setError("Impossible de charger les dossiers.");
        }
      };
      fetchDossPatient();
  }, [fetchDoPatient]);

  //mise à jour
  const handleModifier = async(updatedDossier: Dossier) => {
    
    if(selectedDossier){
        try {
            await axios.put(`http://localhost:5000/dossier/update/${selectedDossier._id}`, 
            selectedDossier );
            toast.success("Dossier mis à jour avec succès !");
            setModifier(false);
            setSelectedDossier(updatedDossier);
            fetchDoPatient();
        } catch (error: any) {
            console.error("Erreur lors de l'ajout ou de la mise à jour du dossier:", error.response?.data || error.message);
            toast.error(`Erreur : ${error.response?.data?.message || "Erreur inconnue"}`);
        }
    }
  };
  //suppression
  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
        return;
    }
    try {
      await axios.delete(`http://localhost:5000/dossier/delete/${id}`);
      toast.success('Dossier supprimé avec succès!');
      fetchDoPatient();
    } catch (error) {
      toast.error('Erreur lors de la suppression du dossier');
    }
  };
  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearchChange = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  // Filtrer les patients en fonction du terme de recherche
  const filteredDossier = (Array.isArray(dossierPatient)? dossierPatient: []).filter(
    (doss) =>
      doss.patient?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doss.patient?.dossierMedical.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doss.numeroDossier?.toString().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredDossier.length / dossierPage);
  const indexOfLastDossier = currentPage * dossierPage;
  const indexOfFirstDossier = indexOfLastDossier - dossierPage;
  const currentDos = filteredDossier.slice(
    indexOfFirstDossier,
    indexOfLastDossier
  );
  return (
    <div className="container mx-auto px-4 py-6">
    <h1 className="text-2xl font-bold mb-4">Liste des Dossiers</h1>
    {/* Champs de recherche */}
    <input
        type="text"
        placeholder="Rechercher un dossier..."
        onChange={(e) => handleSearchChange(e.target.value)}
        className="mb-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full"
      />
  {/*Affichage des dossiers*/}
    {loading && <p>Chargement des Dossier...</p>}
    {error && <p className="text-red-500">{error}</p>}

    {!loading && !error && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
    {currentDos.map((dosP) => (
      
      <div key={dosP._id} className="border p-4 rounded shadow-md">
        <p>
          <strong>Patient :</strong> {dosP.patient?.nom || "Inconnu"}
        </p>
        <p>
          <strong>numeroDossier :</strong> {dosP.numeroDossier}
        </p> 
        <div>
        <p>
            <strong>Diagnostic :</strong>
            </p>
            <ul className="list-disc pl-6">
                {dosP.diagnostic.map((diag, idx) => (
                    <li key={idx}>
                        <p>Note:{diag.note}-
                        Indication: {diag.indication}-
                        Traitement: {diag.traitement}-
                        Type:{diag.type}-
                        Test:{diag.tests}-
                        Date Diagnostic:{new Date (diag.DateDiagnostic).toISOString().split("T")[0]}</p>
                    </li>
                ))}
            </ul>
        </div>
          <button
            className="bg-yellow-500 text-white py-2 px-2 rounded"
            onClick={() => {
              setSelectedDossier(dosP);
              setModifier(true);
            }}
          >
            Modifier
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded ml-2"
            onClick={() => handleDelete(dosP._id)}
          >
            Supprimer
          </button>
        </div>
    
    ))}
    </div>
  )}

   {/* Formulaire de mise à jour */}
   {modifier && selectedDossier && (
      <div className="mt-6 border p-4 rounded shadow-md bg-gray-100">
      <h3 className="text-lg font-semibold">Modifier ce dossier</h3>
    
      {/* diagnostic */}
      <h3 className="mt-4 text-lg font-semibold">Diagnostic: </h3>
        <ul className="list-disc pl-6">
          {selectedDossier.diagnostic.map((diag, idx) => (
            <li key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                value={diag.note}
                onChange={(e) => {
                  const updatedDiag = [...selectedDossier.diagnostic];
                  updatedDiag[idx].note = e.target.value;
                  setSelectedDossier({ ...selectedDossier, diagnostic: updatedDiag });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={diag.indication}
                onChange={(e) => {
                  const updatedDiag = [...selectedDossier.diagnostic];
                  updatedDiag[idx].indication = e.target.value;
                  setSelectedDossier({ ...selectedDossier, diagnostic: updatedDiag });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={diag.tests.join(",")}
                onChange={(e) => {
                  const updatedDiag = [...selectedDossier.diagnostic];
                  updatedDiag[idx].tests = e.target.value.split(",").map((test) => test.trim());
                  setSelectedDossier({ ...selectedDossier, diagnostic: updatedDiag });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={diag.type}
                onChange={(e) => {
                  const updatedDiag = [...selectedDossier.diagnostic];
                  updatedDiag[idx].type = e.target.value;
                  setSelectedDossier({ ...selectedDossier, diagnostic: updatedDiag });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={diag.traitement}
                onChange={(e) => {
                  const updatedDiag = [...selectedDossier.diagnostic];
                  updatedDiag[idx].traitement = e.target.value;
                  setSelectedDossier({ ...selectedDossier, diagnostic: updatedDiag });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="date"
                value={diag.DateDiagnostic ? new Date(diag.DateDiagnostic).toISOString().slice(0, 10) : ''}
                onChange={(e) => {
                  const updatedDiag = [...selectedDossier.diagnostic];
                  updatedDiag[idx].DateDiagnostic = e.target.value;
                  setSelectedDossier({ ...selectedDossier, diagnostic: updatedDiag });
                }}
              />

              <button
                onClick={() => {
                  const updatedDiag = selectedDossier.diagnostic.filter((_, index) => index !== idx);
                  setSelectedDossier({ ...selectedDossier,diagnostic: updatedDiag });
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
            setSelectedDossier({
              ...selectedDossier,
              diagnostic: [...selectedDossier.diagnostic, { 
                note: "", 
                indication: "",
                tests: [],
                traitement:"",
                type:"",
                DateDiagnostic:"" }],
            })
          }
          className="mt-2 bg-green-500 text-white py-2 px-4 rounded"
        >
          Ajouter un Diagnostic
        </button>
      {/* numeroDossier */}
      {selectedDossier.numeroDossier && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Remarques</label>
          <input
            type="text"
            value={selectedDossier.numeroDossier }
            onChange={(e) =>
              setSelectedDossier({ ...selectedDossier,numeroDossier: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      )}
  
      {/* Boutons Sauvegarder et Annuler */}
    <div className="flex justify-between mt-4">
      <button
        onClick={() => handleModifier(selectedDossier)}
        className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
      >
        Sauvegarder
      </button>
      <button
        onClick={() => setModifier(false)}
        className="ml-4 px-6 py-2 bg-gray-300 text-gray-700 rounded-md shadow-md hover:bg-gray-400"
      >
        Annuler
      </button>
      </div>
    </div>
  )}

{/* Pagination */}
<div className="flex flex-col items-center mt-4 space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-md bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
      >
        Précédent
      </button>

      <div className="flex justify-center items-center space-x-1">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`mx-1 px-3 py-1 rounded-md ${
              currentPage === index + 1
                ? "bg-cyan-600 text-white"
                : "bg-cyan-300 hover:bg-cyan-400"
            }`}
          >
            {index + 1}
          </button>
           ))}
          </div>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-md bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50"
          >
          Suivant
          </button>
      </div>
    </div>
  );
};

export default dossierList;
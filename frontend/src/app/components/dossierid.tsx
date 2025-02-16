"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Patient {
    _id:string;
    nom: string;
    codePatient: string;
    dossierMedical: string;
    dateEntree: Date;
}

interface Diagnostics {
  note: string;
  indication: string;
  tests: string[];
  type: string;
  traitement: string;
  DateDiagnostic: string;
}

interface Dossier {
  _id?: string;
  patient: Patient | null;
  diagnostic: Diagnostics[];
  numeroDossier?: string;
}


const DossierPourID: React.FC= () => {
  const [patientD, setPatientD] = useState<Patient []>([]);
  const [patientS, setPatientS] = useState<Patient | null>(null);
  const [create, setCreate] = useState({
    note: "",
    indication: "",
    tests: [''] ,
    traitement: "",
    type: "",

  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modifier,setModifier] = useState(false);
  const [dossi, setDossi] = useState<Dossier []>([])
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const DosPerPage = 5;

  // Récupérer les patients et des dossiers
  useEffect (() =>{
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, dossiersRes] = await Promise.all([
          axios.get<Patient[]>("http://${process.env.NEXT_PUBLIC_API_URL}/patients"),
          axios.get("http://${process.env.NEXT_PUBLIC_API_URL}/dossier"),
        ]);
        const sortedPatients = patientsRes.data.sort((a, b) => a.nom.localeCompare(b.nom));
        setPatientD(sortedPatients);
        setDossi(dossiersRes.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      toast.error("Erreur lors de la récupération des données.");
    }finally {
      setLoading(false);
    }
  };
  fetchData();
  }, []);
 

  //mise à jour
  const handleModifier = async(updatedDossier: Dossier) => {
      try {
        if (!updatedDossier._id) return;
        await axios.put(`http://${process.env.NEXT_PUBLIC_API_URL}/dossier/update/${updatedDossier._id}`, updatedDossier);
        toast.success("Dossier mis à jour avec succès !");
        setDossi((prev) =>
          prev.map((dossier) => (dossier._id === updatedDossier._id ? updatedDossier : dossier))
        );
        setModifier(false);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            toast.error(`Erreur : ${error.response?.data?.message || "Erreur inconnue"}`);
          } else if (error instanceof Error) {
            toast.error(`Erreur : ${error.message}`);
          } else {
            toast.error("Erreur inconnue");
          }
        }
      };
  
  const handleEditDossier = (dossier: Dossier) => {
    setDossier(dossier);
    setModifier(true);
  };
  // Fonction pour créer un nouveau dossier
  const handleCreateDossier = async () => {
    if(!patientS) return;
    setLoading(true);
    try {
      const newDossier : Omit<Dossier, "_id">={
        patient:patientS,
        numeroDossier: patientS.dossierMedical || "Nouveau",
        diagnostic: [
          {
            DateDiagnostic: patientS.dateEntree ? new Date(patientS.dateEntree).toISOString().split("T")[0] : "",
            note: create.note,
            indication: create.indication,
            tests: create.tests,
            traitement: create.traitement,
            type: create.type,
          }
        ] };
      await axios.post("http://${process.env.NEXT_PUBLIC_API_URL}/dossier/add", newDossier);
      toast.success("Dossier créé avec succès !");
      setDossi((prev) => [...prev, { ...newDossier }]);
      setShowCreateForm(false)
    } catch {
      toast.error("Erreur lors de l'ajout du dossier.");
    } finally{
      setLoading(false)
    }
  };
 
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredPatD = Array.isArray(patientD)
  ?patientD
  .filter(
    (p) =>
      p.nom.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (p.codePatient.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  )
  .sort((a,b) =>a.nom.localeCompare(b.nom))
  : [];

  
  const totalPages = Math.ceil(filteredPatD.length / DosPerPage);
  const indexOfLastdo = currentPage * DosPerPage;
  const indexOfFirstdo = indexOfLastdo - DosPerPage;
  const patientDs = filteredPatD.slice(indexOfFirstdo, indexOfLastdo);


  return (
    <div className="min-h-screen bg-[url('/Logo.PNG')] bg-cover flex justify-center items-center">
      <div className="container mx-auto px-4">
      <h3 className="text-lg font-medium mb-2 text-center">Liste des Patients</h3>
      <div className="mb-16 flex justify-center">
        <input
          type="text"
          placeholder="Rechercher par nom de patient ou code patient"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
      </div>
      <ToastContainer /> 
          {loading && <p>Chargement...</p>}

    {/* Creation du Dossier */}
    {showCreateForm && (
       <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
       <div className="bg-white p-6 rounded shadow-md">
         <h3 className="text-lg font-bold mb-4">
           Ajouter un dossier pour {patientS?.nom}
           </h3>
           <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                    Note
              </label>
              <input
                type="text"
                value={create.note}
                onChange={(e) => setCreate({ ...create, note: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
              </div>
              <div className="mb-4">
           <label className="block text-sm font-medium text-gray-700">
                Indication
              </label>
              <input
                type="text"
                value={create.indication}
                onChange={(e) => setCreate({ ...create, indication: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
              </div>
              <div className="mb-4">
           <label className="block text-sm font-medium text-gray-700">
                Tests
              </label>
              <input
                type="text"
                value={create.tests.join(",")}
                onChange={(e) => setCreate({ ...create, tests: e.target.value.split(",").map((item) => item.trim())})}
                className="w-full px-4 py-2 border rounded"
                required
              />
              </div>
              <div className="mb-4">
           <label className="block text-sm font-medium text-gray-700">
                Traitement
              </label>
              <input
                type="text"
                value={create.traitement}
                onChange={(e) => setCreate({ ...create, traitement: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
              </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={create.type}
                    onChange={(e) => setCreate({ ...create, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                    required
                  >
                    <option value="">Quel Type ?</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Intervention">Intervention</option>
                    <option value="Suivi">Suivi</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleCreateDossier}
              >
                Sauvegarder
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                onClick={() => setShowCreateForm(false)}
              >
                Annuler
              </button>
            </div>
        </div>
        </div>
    )}
  
    {/* Formulaire de mise à jour */}
    {modifier && dossier && (
        <div className="mt-6 border p-4 rounded shadow-md bg-gray-100">
        <h3 className="text-lg font-semibold">Patient {dossier.patient?.nom} </h3>
      
        {/* diagnostic */}
        <h3 className="mt-4 text-lg font-semibold">Diagnostic: </h3>
          <ul className="list-disc pl-6">
            {dossier.diagnostic.map((diag, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={diag.note}
                  onChange={(e) => {
                    const updatedDiag = [...dossier.diagnostic];
                    updatedDiag[idx].note = e.target.value;
                    setDossier({ ...dossier, diagnostic: updatedDiag });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <input
                  type="text"
                  value={diag.indication}
                  onChange={(e) => {
                    const updatedDiag = [...dossier.diagnostic];
                    updatedDiag[idx].indication = e.target.value;
                    setDossier({ ...dossier, diagnostic: updatedDiag });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <input
                  type="text"
                  value={diag.tests.join(",")}
                  onChange={(e) => {
                    const updatedDiag = [...dossier.diagnostic];
                    updatedDiag[idx].tests = e.target.value.split(",").map((test) => test.trim());
                    setDossier({ ...dossier, diagnostic: updatedDiag });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <select
                  value={diag.type}
                  onChange={(e) => {
                    const updatedDiag = [...dossier.diagnostic];
                    updatedDiag[idx].type = e.target.value;
                    setDossier({ ...dossier, diagnostic: updatedDiag });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                   <option value="">Quel Type ?</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Intervention">Intervention</option>
                    <option value="Suivi">Suivi</option>
                  </select>
                <input
                  type="text"
                  value={diag.traitement}
                  onChange={(e) => {
                    const updatedDiag = [...dossier.diagnostic];
                    updatedDiag[idx].traitement = e.target.value;
                    setDossier({ ...dossier, diagnostic: updatedDiag });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <input
                    type="date"
                    value={diag.DateDiagnostic ? new Date(diag.DateDiagnostic).toISOString().slice(0, 10) : ''}
                    onChange={(e) => {
                      const updatedDiag = [...dossier.diagnostic];
                      updatedDiag[idx].DateDiagnostic = e.target.value;
                      setDossier({ ...dossier, diagnostic: updatedDiag });
                    }}
                  />

                <button
                  onClick={() => {
                    const updatedDiag = dossier.diagnostic.filter((_, index) => index !== idx);
                    setDossier({ ...dossier,diagnostic: updatedDiag });
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
              setDossier({
                ...dossier,
                diagnostic: [...dossier.diagnostic, { 
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
        {dossier.numeroDossier && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Remarques</label>
            <input
              type="text"
              value={dossier.numeroDossier }
              onChange={(e) =>
                setDossier({ ...dossier,numeroDossier: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}
    
        {/* Boutons Sauvegarder et Annuler */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => handleModifier(dossier)}
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
      {/* Affichage des dossier  */}
      <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white shadow-md rounded-lg text-sm sm:text-base">
            <thead className="bg-cyan-500">
              <tr>
                <th className="py-3 px-4 text-left">Nom</th>
                <th className="py-3 px-4 text-left">Code Patient</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* la verification */}
            {patientDs.map((patient) => {
              const existingDossier = dossi.find(
                (dossier) => dossier.patient?._id === patient._id
              );

              return (
                <tr key={patient._id} className="border-b">
                  <td className="py-3 px-4">{patient.nom}</td>
                  <td className="py-3 px-4">{patient.codePatient}</td>
                  <td className="py-3 px-4 text-center">
                    {existingDossier ? (
                      <button
                        className="bg-cyan-500 text-white px-4 py-2 rounded"
                        onClick={() => handleEditDossier(existingDossier)}
                      >
                        Voir le Dossier 
                      </button>
                    ) : (
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={() => {setPatientS(patient);
                          setShowCreateForm(true);
                        }}
                      >
                        Ajouter Dossier
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
    </div>
  );
};

export default DossierPourID;

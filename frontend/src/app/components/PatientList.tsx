"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Patient {
  _id: string;
  nom: string;
  codePatient: string;
  numAssuranceMaladie: string;
  numTelephone: number;
  dateEntree: Date;
  dossierMedical: string;
}

interface PatientListProps {
  fetchPatients: () => void;
}

const PatientList: React.FC<PatientListProps> = ({ fetchPatients }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const patientsPerPage = 5;

  // Charger les patients et les trier par nom
  useEffect(() => {
    const fetchData = async () => {
      try {
       
        const response = await axios.get<Patient[]>("http://${process.env.NEXT_PUBLIC_API_URL}/patients");
        const sortedPatients = response.data.sort((a, b) => a.nom.localeCompare(b.nom)); // Tri par nom
        setPatients(sortedPatients);
      } catch (err) {
        console.error("Erreur lors de la récupération des patients :", err);
        toast.error("Erreur lors de la récupération des patients.");
      } 
    };

    fetchData();
  }, []);

  // Débouncer le terme de recherche 
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filtrer les patients et les trier
  const filteredPatients = Array.isArray(patients)
  ? patients
      .filter(
        (patient) =>
          patient.nom.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          patient.codePatient.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          patient.numTelephone.toString().includes(debouncedSearchTerm.toLowerCase())
      )
      .sort((a, b) => a.nom.localeCompare(b.nom)) 
  : [];


  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  // Supprimer un patient
  const handleDelete = async (patientId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
      return;
    }
    try {
      await axios.delete(`http://${process.env.NEXT_PUBLIC_API_URL}/patients/delete/${patientId}`);
      toast.success("Patient supprimé avec succès !");
      fetchPatients(); 
    } catch (err) {
      console.error("Erreur de suppression :", err);
      toast.error("Erreur lors de la suppression du patient.");
    }
  };

  // Mettre à jour un patient
  const handleUpdate = async () => {
    if (currentPatient) {
      try {
        await axios.put(
          `http://${process.env.NEXT_PUBLIC_API_URL}/patients/${currentPatient._id}`,
          currentPatient
        );
        toast.success("Patient mis à jour avec succès !");
        setIsEditing(false);
        setCurrentPatient(null);
        fetchPatients();
      } catch (err) {
        console.error("Erreur lors de la mise à jour :", err);
        toast.error("Erreur lors de la mise à jour du patient.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[url('/Logo.PNG')] bg-cover flex justify-center items-center">
      <div className="container mx-auto px-4">
      <ToastContainer />

        {/* Barre de recherche */}
        <div className="mb-16 flex justify-center">
          <input
            type="text"
            placeholder="Rechercher un patient"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Formulaire de mise à jour */}
        {isEditing && currentPatient && (
          <div className="mb-6 bg-white p-6 shadow-lg rounded-md">
            <h3 className="text-lg font-semibold mb-4">Mettre &agrave; jour le patient</h3>
            {/* Champs du formulaire */}
            {[
              { label: "Nom", value: currentPatient.nom, key: "nom" },
              { label: "Code Patient", value: currentPatient.codePatient, key: "codePatient" },
              {
                label: "Numéro Assurance",
                value: currentPatient.numAssuranceMaladie,
                key: "numAssuranceMaladie",
              },
              {
                label: "Numéro Téléphone",
                value: currentPatient.numTelephone,
                key: "numTelephone",
              },
              {
                label: "dossierMedical",
                value: currentPatient.dossierMedical,
                key: "dossierMedical",
              },
            ].map((field) => (
              <div className="mb-4" key={field.key}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.key === "numTelephone" ? "number" : "text"}
                  value={field.value}
                  onChange={(e) =>
                    setCurrentPatient({
                      ...currentPatient,
                      [field.key]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Date d&apos;Entr&eacute;e</label>
              <input
                type="date"
                value={
                  currentPatient.dateEntree
                    ? new Date(currentPatient.dateEntree).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setCurrentPatient({
                    ...currentPatient,
                    dateEntree: new Date(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
              >
                Mettre à jour
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="ml-4 px-6 py-2 bg-gray-300 text-gray-700 rounded-md shadow-md hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des patients */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white shadow-md rounded-lg text-sm sm:text-base">
            <thead className="bg-cyan-500">
              <tr>
                <th className="py-3 px-4 text-left">Nom</th>
                <th className="py-3 px-4 text-left">Code Patient</th>
                <th className="py-3 px-4 text-left">Numero Telephone</th>
                <th className="py-3 px-4 text-left">Dossier Medical </th>
                <th className="py-3 px-4 text-left">Numero Assurance</th>
                <th className="py-3 px-4 text-left">Date d&apos;Entr&eacute;e</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.map((patient) => (
                <tr key={patient._id} className="border-b">
                  <td className="py-3 px-4">{patient.nom}</td>
                  <td className="py-3 px-4">{patient.codePatient}</td>
                  <td className="py-3 px-4">{patient.numTelephone}</td>
                  <td className="py-3 px-4">{patient.dossierMedical}</td>
                  <td className="py-3 px-4">{patient.numAssuranceMaladie}</td>
                  <td className="py-3 px-4">
                    {new Date(patient.dateEntree).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setCurrentPatient(patient);
                        setIsEditing(true);
                      }}
                      className="mr-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-700"
                      aria-label="Modifier le patient"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(patient._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
                      aria-label="Supprimer le patient"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
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
            Precedent
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

export default PatientList;

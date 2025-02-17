"use client"
import { useState } from "react";
import axios, { AxiosError } from "axios";

import { useRouter, useSearchParams } from "next/navigation";

interface PatientProps {
  fetchPatients: () => void; 
}

const Patient: React.FC<PatientProps> = ({ fetchPatients }) => {
  const [patients, setPatients] = useState({
    nom: "",
    codePatient: "",
    numTelephone: "",
    numAssuranceMaladie: "",
    dateEntree: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const receptionnisteId = searchParams.get("receptionnisteId");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

        if(!patients.nom || !patients.codePatient || !patients.numTelephone ||!patients.numAssuranceMaladie || !patients.dateEntree ) {
            setErrorMessage(" Remplissez les Champs svp");
            return;
        }
        try {
            await axios.post("https://gestion-hopital-api.vercel.app/patients/Add", { ...patients });

            setSuccessMessage("Patient ajouté avec succès !");
            setErrorMessage("");
            fetchPatients();
            setPatients({
                nom:"",
                codePatient:"",
                numTelephone:"",
                numAssuranceMaladie:"",
                dateEntree:"",
            });

            if (receptionnisteId) {
              router.push(`/receptionniste?id=${receptionnisteId}`);
            } else {
              console.error("Impossible de rediriger : ID de la réceptionniste manquant.");
            }
            
          } catch (error: unknown) {
            console.error("Erreur lors de l'ajout :", error);
            const er = error as AxiosError;
            setErrorMessage(
              (er.response?.data as { message: string })?.message || "Une erreur est survenue."
            );
          }
        };
      
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semiblod mb-4">Ajouter un patient</h2>
          <form onSubmit={handleSubmit} >
            {/* Message de succès ou d'erreur */}
            {successMessage && (
                <div className="mb-4 p-4 text-gray-600 bg-green-100 rounded-md">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
                    {errorMessage}
                </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black-700">Nom</label>
              <input
                type="text"
                name="nom"
                value={patients.nom}
                onChange={(e) => setPatients({ ...patients, nom: e.target.value })}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
      
            <div className="mb-4">
              <label className="block text-sm font-medium text-black-700">Code Patient</label>
              <input
                type="text"
                name="codePatient"
                value={patients.codePatient}
                onChange={(e) => setPatients({ ...patients, codePatient: e.target.value })}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
      
            <div className="mb-4">
              <label className="block text-sm font-medium text-black-700">Numero Assurance</label>
              <input
                type="text"
                name="numAssuranceMaladie"
                value={patients.numAssuranceMaladie}
                onChange={(e) => setPatients({ ...patients, numAssuranceMaladie: e.target.value })}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
      
            <div className="mb-4">
              <label className="block text-sm font-medium text-black-700">Numero Telephone</label>
              <input
                type="text"
                name="numTelephone"
                value={patients.numTelephone}
                onChange={(e) => setPatients({ ...patients, numTelephone: e.target.value })}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>     
            <div className="mb-4">
              <label className="block text-sm font-medium text-black-700">Date d&apos;Entr&eacute;e</label>
              <input
                type="date"
                name="dateEntree"
                value={patients.dateEntree}
                onChange={(e) => setPatients({ ...patients, dateEntree: e.target.value })}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
      
            <button
              type="submit"
              className="w-full py-2 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Ajouter
            </button>
          </form>
          </div>
        );
      };
      
      export default Patient;
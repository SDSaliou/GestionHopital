"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import PatientList from "../../components/PatientList";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withRoleProtection from "@/app/components/protectionPage";

const PatientListe: React.FC = () => {
    const [recDetails, setRecDetails] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [patients, setPatients] = useState([]);
  
    const fetchRecDetails = async () => {
      try {
          const token = localStorage.getItem("token");
          const userId = localStorage.getItem("userId");
    
          if (!token || !userId) throw new Error("Utilisateur non authentifié.");
    
          const { data } = await axios.get(`http://localhost:5000/personnels/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRecDetails(data.nom);
        } catch (err: any) {
          setError(err.message || "Erreur lors de la récupération des détails du médecin.");
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
        fetchRecDetails();
    }, []);

 // Fonction pour récupérer les patients
  const fetchPatients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/patients/");
      setPatients(response.data); // Mise à jour des patients dans l'état
      console.log("Patients récupérés :", response.data);
    } catch (error) {
      console.error("Erreur en récupérant les patients :", error);
      toast.error("Erreur lors de la récupération des patients.");
    }
  };


  useEffect(() => {
    if (recDetails) {
        fetchPatients();
      }
    }, [recDetails]);

  return (
    <div className="flex flex-col items-center justify-center">
       {loading && <p>Chargement des données...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Affichage des patients lorsque les données sont chargées */}
        {!loading && !error && patients.length > 0 && (
          <PatientList  fetchPatients={fetchPatients} />
        )}

        {/* Affichage si aucun patient n'est trouvé */}
        {!loading && !error && patients.length === 0 && (
          <p>Aucun patient trouvé.</p>
        )}
        <ToastContainer />
     </div>
     
 
);
};

export default withRoleProtection(PatientListe,["Receptionniste"]);

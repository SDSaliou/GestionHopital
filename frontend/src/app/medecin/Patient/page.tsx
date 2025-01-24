"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DossierPourID from "@/app/components/dossierid";
import Link from "next/link";
import withRoleProtection from "@/app/components/protectionPage";

const PatientListe: React.FC = () => {
  const [medDetails, setMedDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]); 

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setError("Utilisateur non authentifié. Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost:5000/personnels/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMedDetails(data.nom);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails :", error);
      setError("Impossible de récupérer les détails de l'utilisateur.");
      toast.error("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
        fetchUserDetails();
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
    if (medDetails) {
        fetchPatients();
      }
    }, [medDetails]);

  // if (loading) {
  //   return <div>Chargement...</div>;
  // }

  return (
    <div >
       {loading && <p>Chargement des données...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Affichage des patients lorsque les données sont chargées */}
        {!loading && !error && patients.length > 0 && (
          <DossierPourID />
        )}

        {/* Affichage si aucun patient n'est trouvé */}
        {!loading && !error && patients.length === 0 && (
          <p>Aucun patient trouvé.</p>
        )}
        
     </div>
     
 
);
};

export default withRoleProtection(PatientListe,["Medecin"]);

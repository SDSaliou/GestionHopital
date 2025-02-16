"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DossierPourID from "@/app/components/dossierid";
import withRoleProtection from "@/app/components/protectionPage";

const PatientListe: React.FC = () => {
  const [medDetails, setMedDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      toast.error("Utilisateur non authentifié. Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(
        `http://${process.env.NEXT_PUBLIC_API_URL}/personnels/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMedDetails(data.nom);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails :", error);
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
      const response = await axios.get("http://${process.env.NEXT_PUBLIC_API_URL}/patients/");
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


  return (
    <div >
       {loading && <p>Chargement des données...</p>}

        {/* Affichage des patients lorsque les données sont chargées */}
        {!loading  && (
          <DossierPourID />
        )}

        {/* Affichage si aucun patient n'est trouvé */}
        {!loading  && (
          <p>Aucun patient trouvé.</p>
        )}
        
     </div>
     
 
);
};

export default withRoleProtection(PatientListe,["Medecin"]);

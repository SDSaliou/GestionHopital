"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import OrdonnanceForm from "@/app/components/ordiForm";
import withRoleProtection from "@/app/components/protectionPage";

const OrdonnanceAdd: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
 
  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setError("Utilisateur non authentifié. Veuillez vous connecter.");
      return;
    }

    try {
      await axios.get(
        `https
://gestion-hopital-api.vercel.app/personnels/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des détails :", error);
      setError("Impossible de récupérer les détails de l'utilisateur.");
      toast.error("Erreur lors de la récupération des données.");
    }
  };

  const fetchOrdonnances = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Utilisateur non authentifié.");
      return;
    }

    try {
      await axios.get("https://gestion-hopital-api.vercel.app/ordonnance/", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch  {
      setError("Erreur lors de la récupération des ordonnances.");
      toast.error("Erreur lors de la récupération des ordonnances.");
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchOrdonnances();
  }, []); 

  
  return (
    <div className="flex justify-center items-center">
   
      <div className="p-6 max-w-4xl mx-auto">
       <h2 className="text-2xl font-bold text-black-800 mb-6">Mes Rendez-vous</h2>
       <div className="mb-6">
       {error && <div className="error-message">{error}</div>} 
        <OrdonnanceForm  fetchOrdonnances={fetchOrdonnances} />
         </div>
     </div>
     </div>
  
 
);
};

export default withRoleProtection(OrdonnanceAdd,["Medecin"]);

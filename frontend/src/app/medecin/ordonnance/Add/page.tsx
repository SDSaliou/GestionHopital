"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import OrdonnanceForm from "@/app/components/ordiForm";
import Link from "next/link";
import withRoleProtection from "@/app/components/protectionPage";

const OrdonnanceAdd: React.FC = () => {
  const [medDetails, setMedDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ordonnances, setOrdonnances] = useState<any[]>([]);

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

  const fetchOrdonnances = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Utilisateur non authentifié.");
      return;
    }

    try {
      const { data } = await axios.get("http://localhost:5000/ordonnance/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrdonnances(data);
    } catch (error) {
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
       {error && <div className="error-message">{error}</div>} {/* Display error if any */}
        <OrdonnanceForm fetchOrdonnances={fetchOrdonnances} />
         </div>
     </div>
     </div>
  
 
);
};

export default withRoleProtection(OrdonnanceAdd,["Medecin"]);

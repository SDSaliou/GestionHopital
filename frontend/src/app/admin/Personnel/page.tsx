"use client"

import React, { useState, useEffect } from 'react';
import PersonnelList from '@/app/components/PersonnelList'
import Link from "next/link";
import {toast} from 'react-toastify';
import axios from 'axios';
import withRoleProtection from '@/app/components/protectionPage';

const PersonnelListe: React.FC =() => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [personnels, setPersonnels] = useState([]);
    const [adminDetails, setAdminDetails] = useState<string | null>(null);
    
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  
    
    const fetchUserDetails = async () => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
            setError("Utilisateur non authentifié. Veuillez vous connecter.");
            setLoading(false);
            return;
        }

        try {
            const {data} = await axios.get(`http://localhost:5000/personnels/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }
            );
            if (typeof data.nom === "string") {
                setAdminDetails(data.nom); 
              } else {
                throw new Error("Format de données inattendu pour 'nom'");
              }   
        } catch (error) {
            console.error("Erreur lors de la récupération des détails :", error);
            setError("Impossible de récupérer les détails de l'utilisateur.");
            toast.error("Erreur lors de la récupération des données.");
            } finally {
              setLoading(false);
            }
    };

    useEffect(() => {
        // Appel de la fonction fetchUserDetails pour récupérer les détails de l'utilisateur
        fetchUserDetails();
    },[]);

    // Récupération des données des patients et du personnel
    const fetchData = async () => {
        try {
            const personnelsRes= await
                axios.get("http://localhost:5000/personnels/")
            setPersonnels(personnelsRes.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
            setError("Erreur lors de la récupération des données.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
            if(adminDetails){
                fetchData();
            }
        },[adminDetails]);
  
        return (
    <div className="flex flex-col items-center justify-center">
    {loading && <p>Chargement des données...</p>}
     {error && <p className="text-red-500">{error}</p>}

     {/* Affichage des patients lorsque les données sont chargées */}
     {!loading && !error && personnels.length > 0 && (
       <PersonnelList personnels={personnels} fetchPersonnels={fetchData} />
     )}

     {/* Affichage si aucun patient n'est trouvé */}
     {!loading && !error && personnels.length === 0 && (
       <p>Aucun personnel trouvé.</p>
     )}
     
  </div>
  )
}
export default withRoleProtection(PersonnelListe, ["Admin"]);
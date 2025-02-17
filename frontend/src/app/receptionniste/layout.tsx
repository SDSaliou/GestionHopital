"use client";

import React, { ReactNode, useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios, {AxiosError} from "axios";
import Link from "next/link";


const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recDetails, setRecDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecDetails = async () => {
    try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const service = localStorage.getItem("service");
  
        if (!token || !userId || !service) throw new Error("Utilisateur non authentifié.");
  
        const { data } = await axios.get(`https://gestion-hopital-api.vercel.app/personnels/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecDetails(data.nom);
      } catch (err){
      const errorResponse = err as AxiosError;
      setError((errorResponse.response?.data as { message: string })?.message ||  "Erreur lors de la récupération des détails du médecin.");
      } finally {
        setLoading(false);
      }
    };

  // Charger les détails de l'utilisateur à l'initialisation
  useEffect(() => {
    fetchRecDetails();
  }, []);

  const retour = () => {
    window.location.href = "/receptionniste/RvAdd";
  }
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("service");
    window.location.href = "/login";
  };

  if (loading) {
    return <div className="text-center mt-10">Chargement en cours...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{error}</p>
        <Link href="/login" className="text-blue-500 underline">
          Veuillez vous connecter
        </Link>
      </div>
    );
  }

  return (
    <NavBar
      sidebarTitle={[
        { label: "Liste des Patients", path: "/receptionniste/patient" },
        { label: "Les Rendez-vous", path: "/receptionniste/RvAdd/RvList"},
        {
          label: "Ajouter un patient",
          path: "/receptionniste/patient/Add", 
        },
        { label: "Liste des Hospitalisation", path: "/receptionniste/hospitalisation" },
        { label: "Ajouter une Hospitalisation", path: "/receptionniste/hospitalisation/add" },
        { label: "Liste des dossiers ", path:"/receptionniste/dossierPatient"}
      ]}
      buttonLinks={[
        { label: recDetails || "Profil", path: "/receptionniste/RvAdd", onClick: retour },
        { label: "Déconnexion", path: "/login", onClick: handleLogout },
      ]}
    >
      {children}
    </NavBar>
  );
};

export default Layout;

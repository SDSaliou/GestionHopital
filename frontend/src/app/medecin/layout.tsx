"use client";

import React, { ReactNode, useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios , { AxiosError } from "axios";
import Link from "next/link";
import withRoleProtection from "../components/protectionPage";

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medDetails, setMedDetails] = useState<string | null>(null);

  const fetchMedDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) throw new Error("Utilisateur non authentifié.");

      const { data } = await axios.get(`http://localhost:5000/personnels/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedDetails(data.nom);
    } catch (err) {
      const errorResponse = err as AxiosError;
      setError((errorResponse.response?.data as { message: string })?.message || "Erreur lors de la récupération des détails du médecin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  const retour =() =>{
    window.location.href = "/medecin/Rv";
  }

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
        { label: "Liste des Patients", path: "/medecin/Patient" },
        { label: "Liste des Ordonnances", path: "/medecin/ordonnance" },
        { label: "Hospitalisations", path: "/medecin/hospitalisation" },
        { label: "Mes Rendez-vous", path: "/medecin/Rv" },
      ]}
      buttonLinks={[
        { label: medDetails || "Profil", path: "/medecin/Rv",onClick:retour },
        { label: "Déconnexion", path: "/login", onClick: handleLogout },
      ]}
    >
      {children}
    </NavBar>
  );
};

export default withRoleProtection(Layout,["Medecin"]);

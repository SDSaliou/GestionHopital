"use client";

import React, { ReactNode, useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminDetails, setAdminDetails] = useState<string | null>(null);

  useEffect(() => {
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
        const { data } = await axios.get(
          `https://gestion-hopital-api.vercel.app/personnels/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (typeof data.nom === "string") {
          setAdminDetails(data.nom);
        } else {
          throw new Error("Format de données inattendu pour 'nom'");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails :", error);
        setError("Impossible de récupérer les détails de l'utilisateur.");
        toast.error("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  const retour = () => {
    window.location.href = "/admin";
  };

  if (loading) {
    return <div className="text-center mt-10">Chargement...</div>;
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

  if (!adminDetails) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">Détails utilisateur introuvables.</p>
      </div>
    );
  }

  return (
    <NavBar
      sidebarTitle={[
        { label: "Liste du personnel", path: "/admin/Personnel" },
        { label: "Ajout personnel", path: "/admin/add" },
      ]}
      buttonLinks={[
        { label: adminDetails || "Profil", path: "/admin/Personnel", onClick: retour },
        { label: "Déconnexion", path: "/login", onClick: handleLogout },
      ]}
    >
      <div className="p-4 md:p-8">{children}</div>
    </NavBar>
  );
};

export default Layout;

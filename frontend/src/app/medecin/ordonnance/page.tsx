"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import OrdonnanceList from "../../components/ordiList";
import Link from "next/link";
import withRoleProtection from "@/app/components/protectionPage";



const Ordonnance: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ordonnances, setOrdonnances] = useState([]);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setError("Utilisateur non authentifié. Veuillez vous connecter.");
      setLoading(false);
      return;
    }

    try {
      await axios.get(
        `https://gestion-hopital-api.vercel.app/personnels/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const { data } = await axios.get("https://gestion-hopital-api.vercel.app/ordonnance/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrdonnances(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des ordonnances :", error);
      setError("Erreur lors de la récupération des ordonnances.");
      toast.error("Erreur lors de la récupération des ordonnances.");
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchOrdonnances();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-gray-700">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Rendez-vous</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Bouton pour ajouter une ordonnance */}
        <div className="mb-6">
          <Link href="/medecin/ordonnance/Add">
            <button className="px-6 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition">
              Ajouter une ordonnance
            </button>
          </Link>
        </div>

        {/* Liste des ordonnances */}
        <div>
          <OrdonnanceList
            ordonnances={ordonnances}
            fetchOrdonnances={fetchOrdonnances}
          />
        </div>
      </div>
    </div>
  );
};

export default withRoleProtection(Ordonnance, ["Medecin"]);

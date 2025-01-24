"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import HospiForm from "@/app/components/hospiAdd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withRoleProtection from "@/app/components/protectionPage";

const Hospi: React.FC = () => {
  const [hospi, setHospi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchHospi = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("http://localhost:5000/Chambre/");
      setHospi(data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Impossible de récupérer les données. Réessayez plus tard.");
      toast.error("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospi();
  }, []);

  return (
    <div className="mx-auto py-24 px-8">
      <HospiForm fetchHospi={fetchHospi} />
      <ToastContainer />
    </div>
  );
};

export default withRoleProtection(Hospi, ["Receptionniste"]);

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import HospiForm from "@/app/components/hospiAdd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withRoleProtection from "@/app/components/protectionPage";

const Hospi: React.FC = () => {
  
  const [loading, setLoading] = useState(true);
 
  const fetchHospi = async () => {
    setLoading(true);
    toast.error("");
    try {
      await axios.get("http://localhost:5000/Chambre/");
    } catch  {
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
      {loading ? (
      <p>Chargement...</p>
  ) : (
      <HospiForm fetchHospi={fetchHospi} />
    )}
     <ToastContainer />
    </div>
  );
};

export default withRoleProtection(Hospi, ["Receptionniste"]);

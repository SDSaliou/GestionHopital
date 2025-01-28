"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import HospitalisationList from "@/app/components/HospitalisationList";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withRoleProtection from "@/app/components/protectionPage";


const Hospitalisation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  

  // Fonction pour récupérer les données des hospitalisations
  const fetchHospi = async () => {
    try {
      const response = await axios.get("http://localhost:5000/hospitalisation/");
      console.log("Hospi récupérés :", response.data);
      } catch (error) {
        console.error('Erreur en récupérant les hospitalisations', error);
        toast.error('Erreur lors de la récupérant');
      }finally {
        setLoading(false);
      }
   }

  useEffect(() => {
    fetchHospi();
  })


  return (
    <div className="flex flex-col items-center justify-center">
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <HospitalisationList  fetchHospi={fetchHospi} />
      )}


      <ToastContainer />
    </div>
  );
};

export default withRoleProtection(Hospitalisation,["Receptionniste"]);

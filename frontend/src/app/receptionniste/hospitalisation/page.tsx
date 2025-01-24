"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import HospitalisationList from "@/app/components/HospitalisationList";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import withRoleProtection from "@/app/components/protectionPage";

interface Patient {
  nom: string;
  codePatient: string;
  dossierMedical: string | null;
}

interface Chambre {
  numero: string;
  type: string;
}

interface Hospitalisation {
  _id: string;
  patient: Patient;
  chambre: Chambre;
  dateEntree: Date;
  dateSortie: Date;
  notes: string;
}

const Hospitalisation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hospitalisation, setHospitalisation] = useState([]);

  // Fonction pour récupérer les données des hospitalisations
  const fetchHospi = async () => {
    try {
      const response = await axios.get("http://localhost:5000/hospitalisation/");
      setHospitalisation(response.data);
      console.log("Hospi récupérés :", response.data);
      } catch (error) {
        console.error('Erreur en récupérant les hospitalisations', error);
        toast.error('Erreur lors de la récupérant');
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
    <HospitalisationList hospitalisations={hospitalisation} fetchHospi={fetchHospi} />

  )}

  <ToastContainer />
</div>

  );
};

export default withRoleProtection(Hospitalisation,["Receptionniste"]);

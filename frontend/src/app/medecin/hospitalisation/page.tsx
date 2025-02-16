"use client";
import React, { useEffect, useState} from "react";
import HospitalisationList from "../../components/HospitalisationList";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withRoleProtection from "@/app/components/protectionPage";
import axios from "axios";



const HospiPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const fetchHospi = async () => {
    try {
      const response = await axios.get("http://${process.env.NEXT_PUBLIC_API_URL}/hospitalisation/");
      console.log("Hospi récupérés :", response.data);
      } catch (error) {
        console.error('Erreur en récupérant les hospitalisations', error);
        toast.error('Erreur lors de la récupérant');
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

export default withRoleProtection(HospiPage, ["Medecin"]);

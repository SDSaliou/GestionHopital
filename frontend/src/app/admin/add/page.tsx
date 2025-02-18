"use client";

import "react-toastify/dist/ReactToastify.css";
import React from "react";
import axios from "axios";
import Personnel from "@/app/components/PersonnelAdd";
import { ToastContainer } from "react-toastify";
import withRoleProtection from "@/app/components/protectionPage";

const AddPersonnelPage: React.FC = () => {
    const fetchPersonnels = async () => {
      try {
        const response = await axios.get("https://gestion-hopital-api.vercel.app/personnels/"); 
        console.log("Personnel ajouté :", response.data);
      } catch (error) {
        console.error("Erreur en récupérant les données :", error);
      }
    };
  
    return (
      <div className="container mx-auto px-4 py-6">
         <Personnel fetchPersonnel={fetchPersonnels} />
         <ToastContainer />
      </div>
 
      
    );
  };
  export default withRoleProtection(AddPersonnelPage, ["Admin"]);
"use client"
import React from 'react'
import RV from '@/app/components/RendezVous'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withRoleProtection from '@/app/components/protectionPage';

const ReceptionnistePage: React.FC = () => {
  return (
    
      <div className="mx-auto py-24 px-8">
        <RV fetchRV={() => console.log("Rafraîchissement des rendez-vous...")} />
        <ToastContainer />
      </div>
  )
}
export default withRoleProtection(ReceptionnistePage,["Receptionniste"]);
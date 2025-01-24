"use client"

import React from 'react'
import Patient from '@/app/components/PatientForm'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withRoleProtection from '@/app/components/protectionPage';

const page: React.FC = () => {
  return (
    <div className='block p-20 mb-4 items-center justify-center '>
      <Patient fetchPatients={() => console.log("Rafraîchissement des patients...")}/>
      <ToastContainer />
    </div>
  )
}
export default withRoleProtection(page,["Receptionniste"]);
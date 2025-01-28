"use client"
 import React from 'react'
 import RVList from '@/app/components/RVList'
 import {ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import withRoleProtection from '@/app/components/protectionPage';
 
 const ReceptionnisteRV: React.FC = () => {
   return (
     <div>
       <RVList/>
       <ToastContainer />
     </div>
   )
 };
 export default withRoleProtection(ReceptionnisteRV, ['Receptionniste']);
 
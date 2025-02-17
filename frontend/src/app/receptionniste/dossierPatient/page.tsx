"use client"

import React, { useState, useEffect } from 'react';
import DossierList from '../../components/dossierPatientList';
import axios from 'axios';
import withRoleProtection from '@/app/components/protectionPage';

const DossiersPage: React.FC = () => {
    const [dossierPatient, setDossierPatient] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDoPatient = async () => {
        try {
            const response = await axios.get('http://gestion-hopital-api.vercel.app/dossier');
            setDossierPatient(response.data); 
            
        } catch (error) {
            console.error('Erreur lors de la récupération des dossiers', error);
        }finally {
            setLoading(false);
          }
    };

    useEffect(() => {
        fetchDoPatient();
    }, []);

    return (<div className="flex flex-col items-center justify-center">
        {loading ? (
          <p>Chargement...</p>
        ) : (
               <DossierList dossierPatient={dossierPatient} fetchDoPatient={fetchDoPatient} />
        )}
        </div>
    );
};

export default withRoleProtection(DossiersPage,["Receptionniste"]);

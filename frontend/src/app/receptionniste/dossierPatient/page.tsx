"use client"

import React, { useState, useEffect } from 'react';
import DossierList from '../../components/dossierPatientList';
import axios from 'axios';
import withRoleProtection from '@/app/components/protectionPage';

const DossiersPage: React.FC = () => {
    const [dossierPatient, setDossierPatient] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDoPatient = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/dossier');
            setDossierPatient(response.data); 
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors de la récupération des dossiers', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoPatient();
    }, []);

    return (
               <DossierList dossierPatient={dossierPatient} fetchDoPatient={fetchDoPatient} />
        
    );
};

export default withRoleProtection(DossiersPage,["Receptionniste"]);

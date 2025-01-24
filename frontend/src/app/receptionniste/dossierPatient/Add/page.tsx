"use client"

import React, { useState, useEffect } from 'react';
import DossierForm from '../../../components/dossierPatientForm';
import axios from 'axios';
import withRoleProtection from '@/app/components/protectionPage';

const DossierPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/patients/');
        setPatients(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des patients", err);
      }
    };

    fetchPatients();
  }, []);

  const fetchDosPatient = () => {
    
    console.log('Fonction pour mettre à jour les dossiers des patients appelée');
  };

  return (
    <div>
    {loading && <p>Chargement des données...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && patients.length > 0 && (
        <DossierForm fetchDosPatient={fetchDosPatient} />
        )}
        
        {!loading && !error && patients.length === 0 && (
          <p>Aucun patient trouvé.</p>
        )}
      </div>
  );
};

export default withRoleProtection(DossierPage,["Receptionniste"]);

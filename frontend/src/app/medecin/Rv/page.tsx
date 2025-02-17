"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Calendar from "react-calendar";
import withRoleProtection from "@/app/components/protectionPage";
import { toast } from "react-toastify";

interface RV {
  _id: string; 
  patient: {_id:string,nom: string} | null;
  date: Date; 
  heure: string;
}

interface Diagnostics {
  note: string;
  indication:string;
  tests:string[];
  type :string;
  traitement: string;
  DateDiagnostic: string;
}

interface Dossier {
  _id: string;
  patient: { nom: string, dossierMedical: string} | null; 
  diagnostic: Diagnostics[];
  numeroDossier?: string; 
}

const Medecin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [medDetails, setMedDetails] = useState<string | null>(null);
  const [Rv, setRv] = useState<RV[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [details, setDetails] = useState<RV[]>([]);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);



  // Récupérer les détails du médecin connecté
  const fetchMedDetails = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      toast.error("Utilisateur non authentifié.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`http://gestion-hopital-api.vercel.app/personnels/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
 });
      setRv(data);
      setMedDetails(data.nom);
    } catch {
      toast.error("Erreur lors de la récupération des détails du médecin.");
    }
  };

  // Récupérer les rendez-vous du médecin connecté
  const fetchRv = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      toast.error("Utilisateur non authentifié.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`http://gestion-hopital-api.vercel.app/rendezvous/med?medecinId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRv(data);
    } catch {
      toast.error("Erreur lors de la récupération des rendez-vous.");
    }
  };

  //l'affichage du dossier
  const handleVoirDossier = async (patientId: string) => {
    if (!patientId) {
      console.error("ID patient manquant");
      toast.error("Impossible de récupérer le dossier, ID patient manquant.");
      return;
    }
    try {
      const { data } = await axios.get(`http://gestion-hopital-api.vercel.app/dossier/patient/${patientId}`);
      console.log("Dossier récupéré :", data);
      setDossier(data);
      setDossierOpen(true);
      if (!data){
        toast.info("Ce patient n'a pas de dossier!");
      }
    }catch (err) {
      console.error("Erreur lors de la récupération du dossier :", err);
    toast.error("Erreur lors de la récupération du dossier.");
  } 
};

  // Gestion du clic sur la date
  const handleDateClick = (date: Date | Date[]  |null) => {
    if (!date) {
      setDetails([]);
      setSelectedDate(null);
      return;
    }

    if (date instanceof Date) {
      setSelectedDate(date);
      const formatDate = date.toISOString().split("T")[0];
      const rvDate = Rv.filter(
        (rv) => new Date(rv.date).toISOString().split("T")[0] === formatDate
      );
      setDetails(rvDate);
    } else if (Array.isArray(date) && date.length === 2) {
      const startDate = date[0];
      const endDate = date[1];
      const rvDate = Rv.filter(
        (rv) => {
          const rvDate = new Date(rv.date);
          return rvDate >= startDate && rvDate <= endDate;
        }
      );
      setDetails(rvDate);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchMedDetails();
      await fetchRv();
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Chargement en cours...</div>;
  }

  

  if (!medDetails) {
    return (
      <div>
        Veuillez-vous connecter : <Link href="/login">Login</Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
         <h2 className="text-2xl font-bold text-black-800 ">Mes Rendez-vous</h2>
         <div className="mb-6 mt-4 flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
         <Calendar
            onClickDay={handleDateClick}
            value={selectedDate}
            tileContent={({ date }) => {
              const formattedDate = date.toISOString().split("T")[0];
              const hasRv = Rv.some(
                (rv) => new Date(rv.date).toISOString().split("T")[0] === formattedDate
              );
              return hasRv ? (
                <span className="bg-cyan-700 text-white rounded-full px-2 text-sm">
                  ●
                </span>
              ) : null;
            }}
            className="w-full max-w-md mx-auto border border-gray-300 rounded-lg shadow-md p-4 bg-white"
            tileClassName={({ date }) => {
              const formattedDate = date.toISOString().split("T")[0];
              const hasRv = Rv.some(
                (rv) => new Date(rv.date).toISOString().split("T")[0] === formattedDate
              );
              return hasRv ? "text-cyan-600 font-bold" : "";
            }}
            tileDisabled={({ date }) => date < new Date()}
            next2Label={null} 
            prev2Label={null} 
            />
        </div>

         {selectedDate && (
           <div className="mt-6">
             <h3 className="text-xl font-semibold text-black-700 mb-4">Détails des Rendez-vous</h3>
             {details.length === 0 ? (
               <p className="text-black-500">Aucun rendez-vous pour cette date.</p>
             ) : (
               <ul>
                 {details.map((rv, index) => (
                   <li key={`${rv._id}-${index}`} className="mb-4 border-b pb-4">
                     <p className="text-black-800">
                       <strong>Patient :</strong> {rv.patient?.nom || "Nom inconnu"}
                     </p>
                     <p className="text-black-800">
                       <strong>Date :</strong> {new Date(rv.date).toLocaleDateString("fr-FR")}
                     </p>
                     <p className="text-black-800">
                       <strong>Heure :</strong> {rv .heure}
                     </p>
                     <p className="mt-2">
                       <button
                          onClick={() => handleVoirDossier(rv.patient?._id || "")}
                          className="px-4 py-2 text-cyan-800 hover:text-cyan-950 underline"
                        >
                         Voir Dossier
                       </button>
                     </p>
                   </li>
                 ))}
               </ul>
             )}
           </div>
         )}
       </div>
         {/* Modale pour afficher les détails du dossier */}
       {dossierOpen && dossier && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-1/2">
          <h2 className="text-xl font-bold mb-4">
            Dossier Médical de {dossier.patient?.nom}
          </h2>
          <p>
            <strong>Numéro de dossier :</strong> {dossier.numeroDossier || "Non défini"}
          </p>
          <h3 className="text-lg font-semibold mt-4">Diagnostics :</h3>
          {dossier.diagnostic.length === 0 ? (
            <p>Aucun diagnostic trouvé.</p>
          ) : (
            <ul>
              {dossier.diagnostic.map((diag, index) => (
                <li key={index} className="border-b py-2">
                  <p><strong>Note :</strong> {diag.note}</p>
                  <p><strong>Indication :</strong> {diag.indication}</p>
                  <p><strong>Tests :</strong> {diag.tests.join(", ")}</p>
                  <p><strong>Traitement :</strong> {diag.traitement}</p>
                  <p><strong>Date :</strong> {new Date(diag.DateDiagnostic).toLocaleDateString("fr-FR")}</p>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setDossierOpen(false)}
            className="mt-4 text-red-500 underline"
          >
            Fermer
          </button>
        </div>
      </div>
       )}
   </div>
  );
};

export default withRoleProtection(Medecin, ["Medecin"]);

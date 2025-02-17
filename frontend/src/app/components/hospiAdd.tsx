"use client"

import React, { useState, useEffect } from "react";
import axios , {AxiosError} from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


interface Chambre {
  _id: string;
  type: string;
  numero: string;
}

interface Patient {
  _id: string;
  nom: string;
}

interface HospiFormProps{
    fetchHospi:()=> void;
}

const HospiForm: React.FC<HospiFormProps> = ({fetchHospi}) =>{
    const [chambres, setChambres] = useState<Chambre []>([]);
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState<Patient []>([]);
    const [selectType, setSelectType]= useState <string>("");
    const [newHospi, setNewHospi] =useState({
      patient: "",
      chambre: "",
      dateEntree: "",
      notes: "",
    })
    useEffect(() => {
        const fetchData = async () => {
          try {
            const [patientsRes, chambreRes] = await Promise.all([
              axios.get<Patient[]>('https://gestion-hopital-api.vercel.app/patients'),
              axios.get('https://gestion-hopital-api.vercel.app/chambre/'),
            ]);
            const sortedPatients = patientsRes.data
            .sort((a, b) => a.nom.localeCompare(b.nom));
           setPatient(sortedPatients);
            setChambres(chambreRes.data);
          } catch {
            toast.error('Erreur lors du chargement des données');
          }
        };
        fetchData();
      }, []);

      //filtrer selon le type choisi
      const TypeChambre = chambres.filter(
        (chambre) => chambre.type === selectType
      );


      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
          await axios.post('https://gestion-hopital-api.vercel.app/hospitalisation/add', newHospi);
          setNewHospi({
            patient: '',
            chambre: '',
            dateEntree: '',
            notes: ''
          });
          toast.success("Patient Hospitalisé !!");
          fetchHospi();  
        } catch (err) {
          const errorResponse = err as AxiosError;
          toast.error((errorResponse.response?.data as { message: string })?.message || 'Erreur lors de l\'ajout');
        } finally {
          setLoading(false);
        }
      };

    return (
       
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ajouter une hospitalisation</h2>
           <ToastContainer />
          <form onSubmit={handleSubmit}>
            {/* Nom patient */}
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2 text-cyan-700">Patient &agrave; Hospitaliser:</label>
              <select
                name="patient"
                value={newHospi.patient}
                onChange={(e) =>  {
                    setNewHospi({
                      ...newHospi,
                      patient: e.target.value,
                    });
                  }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selectionnez un patient</option>
                {patient.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* type de chambre */}
            <div className="mb-4">
              <label className="block text-lg font-bold text-cyan-700">Type De Chambre&nbsp;: </label>
              <select
                value={selectType}
                onChange={(e) => setSelectType(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selectionnez le type de Chambre&nbsp;:</option>
                  {[ "Cabinet", "Normal"].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
            </div>
                {/* Numero Chambre */}
            <div className="mb-4">
              <label className="block text-lg font-bold text-cyan-700">Numero De Chambre&nbsp;: </label>
              <select
                name="chambre"
                value={newHospi.chambre}
                onChange={(e) =>  setNewHospi({
                  ...newHospi,
                  chambre: e.target.value})
                }
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selectionnez une Chambre&nbsp;:</option>
                {TypeChambre.map((chambre) => (
                  <option key={chambre._id} value={chambre._id}>
                    {chambre.numero} - {chambre.type}
                  </option>
                ))}
              </select>
            </div>

                {/* Date d'entrée */}
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2 text-cyan-700">Date d&apos; entr&eacute;e</label>
              <input
                type="date"
                value={newHospi.dateEntree}
                onChange={(e) => setNewHospi({ ...newHospi, dateEntree: e.target.value })
              }
                min={new Date().toISOString().split("T")[0]}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          {/* Notes */}
            <div className="mb-4">
            <label className="block text-lg font-medium text-cyan-700">
              Notes: 
            </label>
            <input
              type="text"
              value={newHospi.notes}
              onChange={(e) =>
                setNewHospi({ ...newHospi, notes: e.target.value })
              }
              placeholder=" notes? "
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
            {/* Bouton Ajouter */}

            <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-md shadow-md"
          >
            {loading ? "Chargement..." : "Ajouter"}
          </button>
          </form>
        </div>
    )
}
export default HospiForm;
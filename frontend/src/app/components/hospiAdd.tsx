"use client"

import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
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
    const [error, setError] = useState("");
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
              axios.get('http://localhost:5000/patients'),
              axios.get('http://localhost:5000/chambre/'),
            ]);
            setPatient(patientsRes.data);
            setChambres(chambreRes.data);
          } catch (err) {
            setError('Erreur lors du chargement des données');
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
          await axios.post('http://localhost:5000/hospitalisation/add', newHospi);
          setNewHospi({
            patient: '',
            chambre: '',
            dateEntree: '',
            notes: ''
          });
          toast.success("Patient Hospitalisé !!");
          fetchHospi();  
        } catch (err: any) {
          if (err.response) {
            const { message } = err.response.data;
            setError(message); 
            toast.error(message); 
          } else {
            setError("Erreur lors de l'ajout. Veuillez réessayer.");
            toast.error("Erreur lors de l'ajout.");
          }
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
              <label className="block text-lg font-bold mb-2 text-cyan-700">Patient à Hospitaliser:</label>
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
                <option value="">Sélectionnez un patient</option>
                {patient.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* type de chambre */}
            <div className="mb-4">
              <label className="block text-lg font-bold text-cyan-700">Type De Chambre: </label>
              <select
                value={selectType}
                onChange={(e) => setSelectType(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionnez le type de Chambre</option>
                  {[ "Cabinet", "Normal"].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
            </div>
                {/* Numero Chambre */}
            <div className="mb-4">
              <label className="block text-lg font-bold text-cyan-700">Numéro De Chambre: </label>
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
                <option value="">Sélectionnez une Chambre</option>
                {TypeChambre.map((chambre) => (
                  <option key={chambre._id} value={chambre._id}>
                    {chambre.numero} - {chambre.type}
                  </option>
                ))}
              </select>
            </div>

                {/* Date d'entrée */}
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2 text-cyan-700">Date d'entrée</label>
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
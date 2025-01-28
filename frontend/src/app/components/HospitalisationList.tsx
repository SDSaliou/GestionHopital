"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Patient {
  _id: string;
  nom: string;
  codePatient: string;
}

interface Chambre {
  _id: string;
  numero: string;
  type: string;
}

interface Hospitalisation {
  _id?: string;
  patient: Patient | null;
  chambre: Chambre | null;
  dateEntree: Date;
  dateSortie: Date;
  notes: string;
}

interface HospitalisationListProps {
  fetchHospi: () => void;
}

const HospitalisationList: React.FC<HospitalisationListProps> = ({fetchHospi }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentHospi, setCurrentHospi] = useState<Hospitalisation | null>(null);
  const [hospitalisation,setHospitalisation] = useState<Hospitalisation[]>([]);
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [modifier, setModifier] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectType, setSelectType] = useState("nom");

  const hospiPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospiRes, chambresRes, patientRes] = await Promise.all([
          axios.get<Hospitalisation[]>("http://localhost:5000/hospitalisation"),
          axios.get("http://localhost:5000/chambre"),
          axios.get<Patient[]>("http://localhost:5000/patients"),
        ]);
        const sortedPatients = patientRes.data.sort((a, b) => a.nom.localeCompare(b.nom));
        setPatients(sortedPatients);

        const sortedHospi = hospiRes.data.sort((a, b) =>
          (a.patient?.nom || "").localeCompare(b.patient?.nom || "")
        );
        setHospitalisation(sortedHospi);
        setChambres(chambresRes.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        toast.error("Erreur lors de la récupération des données.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filtrer selon le type choisi
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeChambre = e.target.value;
    setSelectType(typeChambre);

    setCurrentHospi((prev) =>
      prev
        ? {
            ...prev,
            chambre: null,
          }
        : prev
    );
  };

  const filteredHospi = hospitalisation
    .filter((hosp) =>
      [hosp.patient?.nom, hosp.patient?.codePatient, hosp.chambre?.numero]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (selectType === "nom") {
        return (a.patient?.nom || "").localeCompare(b.patient?.nom || "");
      }
      if (selectType === "dateEntree") {
        return new Date(a.dateEntree).getTime() - new Date(b.dateEntree).getTime();
      }
      return 0;
    });
  
  

  const totalPages = Math.ceil(filteredHospi.length / hospiPerPage);
  const indexOfLastHospi = currentPage * hospiPerPage;
  const indexOfFirstHospi = indexOfLastHospi - hospiPerPage;
  const currentHospiPage = filteredHospi.slice(indexOfFirstHospi, indexOfLastHospi);

  const formatDate = (date: Date) => (date ? new Date(date).toISOString().split("T")[0] : "");

  const handleUpdate = async () => {
    if (currentHospi) {
      // Vérifier si les dates sont valides
      const dateEntree = currentHospi.dateEntree instanceof Date && !isNaN(currentHospi.dateEntree.getTime())
        ? currentHospi.dateEntree.toISOString()
        : undefined;
  
      const dateSortie = currentHospi.dateSortie instanceof Date && !isNaN(currentHospi.dateSortie.getTime())
        ? currentHospi.dateSortie.toISOString()
        : undefined;
  
      const updatedHospi = {
        ...currentHospi,
        patient: currentHospi.patient?._id, 
        chambre: currentHospi.chambre?._id, 
        dateEntree: dateEntree,
        dateSortie: dateSortie,
      };
  
      try {
        await axios.put(`http://localhost:5000/hospitalisation/${currentHospi._id}`, updatedHospi);
        toast.success("Hospitalisation mise à jour avec succès !");
        setCurrentHospi(null);
        fetchHospi();
        setModifier(false);
        setCurrentPage(1);
      } catch (err) {
        console.error("Erreur lors de la mise à jour :", err);
        toast.error("Erreur lors de la mise à jour.");
      }
    }
  };
  
  

  return (
    <div className="min-h-screen bg-[url('/Logo.PNG')] bg-cover flex justify-center items-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Rechercher par patient, code ou numéro de chambre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <select
            onChange={(e) => setSelectType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="nom">Trier par nom</option>
            <option value="dateEntree">Trier par date d&apos;entr&eacute;e</option>
          </select>
        </div>

        <ToastContainer />
        {modifier && currentHospi && (
          <div className="mb-6 bg-white p-6 shadow-lg rounded-md">
            <h3 className="text-lg font-semibold mb-4">Modifier l&apos;hospitalisation</h3>
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2 text-cyan-700">Patient &agrave; Hospitaliser&nbsp;:</label>
              <select
                name="patient"
                value={currentHospi.patient?._id || ""}
                onChange={(e) =>
                  setCurrentHospi((prev) =>
                    prev
                      ? {
                          ...prev,
                          patient: patients.find((p) => p._id === e.target.value) || null,
                        }
                      : prev
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Selectionnez un patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-lg font-bold text-cyan-700">Type De Chambre &nbsp;: </label>
              <select
                value={selectType || currentHospi?.chambre?.type || ""}
                onChange={handleTypeChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Selectionnez le type de Chambre&nbsp;:</option>
                {["Cabinet", "Normal"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Numéro de Chambre */}
            <div className="mb-4">
              <label className="block text-lg font-bold text-cyan-700">Numero De Chambre&nbsp;: </label>
              <select
                name="chambre"
                value={currentHospi?.chambre?._id || ""}
                onChange={(e) =>
                  setCurrentHospi((prev) =>
                    prev
                      ? {
                          ...prev,
                          chambre: chambres.find((ch) => ch._id === e.target.value) || null,
                        }
                      : prev
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Selectionnez une Chambre&nbsp;: </option>
                {chambres
                  .filter((chambre) => chambre.type === selectType || chambre.type === currentHospi?.chambre?.type) 
                  .map((chambre) => (
                    <option key={chambre._id} value={chambre._id}>
                      {chambre.numero} - {chambre.type}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2 text-cyan-700">Date d&apos;entr&eacute;e</label>
              <input
                type="date"
                value={formatDate(currentHospi.dateEntree)}
                onChange={(e) =>
                  setCurrentHospi((prev) =>
                    prev ? { ...prev, dateEntree: new Date(e.target.value) } : prev
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2 text-cyan-700">Date de sortie</label>
              <input
                type="date"
                value={formatDate(currentHospi.dateSortie)}
                onChange={(e) =>
                  setCurrentHospi((prev) =>
                    prev ? { ...prev, dateSortie: new Date(e.target.value) } : prev
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-bold mb-2 text-cyan-700">Notes</label>
              <input
                type="text"
                value={currentHospi.notes}
                onChange={(e) =>
                  setCurrentHospi((prev) =>
                    prev ? { ...prev, notes: e.target.value } : prev
                  )
                }
                placeholder="Notes..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-md text-white bg-blue-500"
              >
              Modifier
              </button>
              <button
                onClick={() => setModifier(false)}
                className="ml-4 px-6 py-2 bg-gray-300 text-gray-700 rounded-md shadow-md hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {currentHospiPage.length > 0 ? (
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white shadow-md rounded-lg text-sm sm:text-base">
              <thead className="bg-cyan-500">
                <tr>
                  <th className="py-3 px-4 text-left">Patient</th>
                  <th className="py-3 px-4 text-left">Code Patient</th>
                  <th className="py-3 px-4 text-left">Numéro</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                  <th className="py-3 px-4 text-left">Date d&apos;entr&eacute;e</th>
                  <th className="py-3 px-4 text-left">Date de sortie</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentHospiPage.map((hospi) => (
                  <tr key={hospi._id} className="border-b">
                    <td className="py-3 px-4">{hospi.patient?.nom || "Non attribué"}</td>
                    <td className="py-3 px-4">{hospi.patient?.codePatient}</td>
                    <td className="py-3 px-4">{hospi.chambre?.numero}</td>
                    <td className="py-3 px-4">{hospi.chambre?.type}</td>
                    <td className="py-3 px-4">{hospi.notes}</td>
                    <td className="py-3 px-4">{new Date(hospi.dateEntree).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{hospi.dateSortie ? new Date(hospi.dateSortie).toLocaleDateString() : "Non Sortie"}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setCurrentHospi(hospi);
                            setModifier(true);}}
                          className="px-4 py-2 bg-cyan-700 text-white rounded-md"
                        >
                          Modifier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-lg text-gray-700">Aucune hospitalisation trouvée</div>
        )}

        {/* Pagination */}
        <div className="flex flex-col items-center mt-4 space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-md bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
          >
            Précédent
          </button>

          <div className="flex justify-center items-center space-x-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 px-3 py-1 rounded-md ${
                  currentPage === index + 1
                    ? "bg-cyan-600 text-white"
                    : "bg-cyan-300 hover:bg-cyan-400"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-md bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalisationList;

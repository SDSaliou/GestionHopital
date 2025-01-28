"use client";

import React, { useState, useEffect } from "react";
import axios, {AxiosError} from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RendezVous {
  _id: string;
  patient: { nom: string } | null;
  medecin: { nom: string } | null;
  date: string;
  heure: string;
}

interface Medecin {
  _id: string;
  nom: string;
  horaires: string;
  jourService: string[];
}

const RVList: React.FC = () => {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [editingRV, setEditingRV] = useState<RendezVous | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("nom");

  const rvPerPage = 3;

  const fetchRendezVous = async () => {
    try {
      const { data } = await axios.get<RendezVous[]>("http://localhost:5000/rendezvous/");
      const sortedRv = data.sort((a, b) => (a.patient?.nom || "").localeCompare(b.patient?.nom || ""));
      setRendezVous(sortedRv);
    } catch (error) {
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      toast.error("Erreur lors de la récupération des rendez-vous.");
    }
  };

  const fetchMedecins = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<Medecin[]>("http://localhost:5000/personnels/medecins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedecins(data);
    } catch (error) {
      const errorResponse = error as AxiosError;
        toast.error((errorResponse.response?.data as { message: string })?.message || 'Erreur lors de l\'ajout');
        } finally {
        
    }
  };

  useEffect(() => {
    fetchRendezVous();
    fetchMedecins();
  }, []);

  useEffect(() => {
    setCurrentPage(1); 
  }, [searchTerm]);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredRV = rendezVous
    .filter((rv) =>
      [rv.patient?.nom]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "nom") {
        return (a.patient?.nom || "").localeCompare(b.patient?.nom || "");
      }
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime(); 
      }
      return 0;
    });

  
  const totalPages = Math.ceil(filteredRV.length / rvPerPage);
  const indexOfLastrv = currentPage * rvPerPage;
  const indexOfFirstrv = indexOfLastrv - rvPerPage;
  const currentrv = filteredRV.slice(indexOfFirstrv, indexOfLastrv);

  const validateRV = (rv: RendezVous): boolean => {
    const medecin = medecins.find((m) => m.nom === rv.medecin?.nom);
    if (!medecin) {
      toast.error("Médecin non trouvé.");
      return false;
    }
    const selectedDateTime = new Date(`${rv.date}T${rv.heure}`);
    if (selectedDateTime <= new Date()) {
      toast.error("La date et l'heure ne peuvent pas être dans le passé.");
      return false;
    }

    const selectedDay = new Date(rv.date).toLocaleString("fr-FR", { weekday: "long" }).toLowerCase();
    if (!medecin.jourService.some(day => day.toLowerCase() === selectedDay)) {
      toast.error(`Le médecin n'est pas disponible le ${selectedDay}.Disponible les : ${medecin.jourService.join(", ")}`);
      return false;
    }

    const [DebutH, DebutMin] = medecin.horaires.split(" - ")[0].split(":").map(Number);
    const [FinH, FinMin] = medecin.horaires.split(" - ")[1].split(":").map(Number);
    const [selectedH, selectedMin] = rv.heure.split(":").map(Number);

    const isValidTime = selectedH > DebutH || (selectedH === DebutH && selectedMin >= DebutMin);
    const isValidEndTime = selectedH < FinH || (selectedH === FinH && selectedMin <= FinMin);

    if (!isValidTime || !isValidEndTime) {
      toast.error(
        `L'heure choisie (${rv.heure}) est en dehors des horaires du médecin (${medecin.horaires}).`
      );
      return false;
    }

    return true;
  };

  const handleSaveEditRV = async () => {
    if (!editingRV) return;

    if (!validateRV(editingRV)) return;

    setLoadingEdit(true);
    try {
      await axios.put(`http://localhost:5000/rendezvous/update/${editingRV._id}`, editingRV);
      toast.success("Rendez-vous mis à jour avec succès !");
      setEditingRV(null);
      fetchRendezVous();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rendez-vous :", error);
      toast.error("Erreur lors de la mise à jour du rendez-vous.");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDeleteRV = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) return;

    setLoadingDelete(id);
    try {
      await axios.delete(`http://localhost:5000/rendezvous/delete/${id}`);
      toast.success("Rendez-vous supprimé avec succès !");
      fetchRendezVous();
    } catch (error) {
      console.error("Erreur lors de la suppression du rendez-vous :", error);
      toast.error("Erreur lors de la suppression du rendez-vous.");
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/Logo.PNG')] bg-cover flex justify-center items-center">
      <div className="container mx-auto px-4">
       <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom de patient"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-md" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="nom">Trier par Nom</option>
            <option value="date">Trier par Date</option>
          </select>
      </div>
      <ToastContainer />

      <div className="overflow-x-auto mb-6">
      <table className="min-w-full bg-white shadow-md rounded-lg text-sm sm:text-base">
        <thead className="bg-cyan-500">
          <tr>
            <th className="py-3 px-4 text-left">Patient</th>
            <th className="py-3 px-4 text-left">Médecin</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Heure</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentrv.map((rv) => (
            <tr key={rv._id} className="border-b">
              <td className="py-3 px-4">
                {rv.patient?.nom || "Nom introuvable"}
              </td>
              <td className="py-3 px-4">
                 {rv.medecin?.nom || "Nom introuvable"}
              </td>
              <td className="py-3 px-4">
                 {new Date(rv.date).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                 {rv.heure}
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => setEditingRV(rv)}
                    className="px-4 py-2 bg-cyan-700 text-white rounded-md"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteRV(rv._id)}
                    disabled={loadingDelete === rv._id}
                    className={`px-4 py-2 text-white rounded-md ${
                      loadingDelete === rv._id ? "bg-gray-400 cursor-not-allowed" : "bg-red-500"
                    }`}
                  >
                    {loadingDelete === rv._id ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Formulaire d'édition */}
    {editingRV && (
      <div className="mb-6 bg-white p-6 shadow-lg rounded-md">
          <h3 className="text-lg font-semibold mb-4">Mettre à jour le Rendez Vous</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEditRV();
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Medecin</label>
            <select
              value={editingRV.medecin?.nom || ""}
              onChange={(e) =>
                setEditingRV((prev) =>
                  prev
                    ? { ...prev, medecin: { ...prev.medecin, nom: e.target.value } }
                    : prev
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled
              >
                Sélectionnez un médecin
              </option>
              {medecins.map((medecin) => (
                <option key={medecin._id} value={medecin.nom}>
                  {medecin.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={editingRV.date}
              onChange={(e) =>
                setEditingRV((prev) =>
                  prev ? { ...prev, date: e.target.value } : prev
                )
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Heure</label>
            <input
              type="time"
              value={editingRV.heure}
              onChange={(e) =>
                setEditingRV((prev) =>
                  prev ? { ...prev, heure: e.target.value } : prev
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setEditingRV(null)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loadingEdit}
              className={`px-4 py-2 rounded-md text-white ${
                loadingEdit ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
              }`}
            >
              {loadingEdit ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
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

export default RVList;

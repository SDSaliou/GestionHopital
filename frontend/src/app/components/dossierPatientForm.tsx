import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

interface Diagnostics {
  note: string;
  indication:string;
  tests:string[];
  type :string;
  traitement: string;
  DateDiagnostic: string;
}

interface DossierFormProps {
  fetchDosPatient: () => void;
}

const DossierForm: React.FC<DossierFormProps> = ({ fetchDosPatient }) => {
  const [dossier, setDossier] = useState({
    patient: '',
    numeroDossier: '',
    diagnostic: [
      {
        DateDiagnostic: "",
        note: '',
        indication: "",
        tests: [],
        traitement: "",
        type: "",
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const fetchDoPatient = async () => {
      try {
        const patientsRes = await axios.get('http://localhost:5000/patients');
        setPatients(patientsRes.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      }
    };
    fetchDoPatient();
  }, []);

  const handleDiag = (ind: number, field: keyof Diagnostics, value: string | string[]) => {
    const newDiagnostic = [...dossier.diagnostic];
    newDiagnostic[ind][field] = value as any; 
    setDossier({ ...dossier, diagnostic: newDiagnostic });
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/dossier/add', dossier);
      toast.success("Dossier Ajouté !!");
      fetchDosPatient();
      setDossier({
        patient: '',
        numeroDossier: '',
        diagnostic: [{
          DateDiagnostic: "",
          note: '',
          indication: "",
          tests: [],
          traitement: "",
          type: "",
        }]
      });
    } catch (err) {
      setError('Erreur lors de l\'ajout du dossier');
      toast.error('Erreur lors de l\'ajout du dossier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-cyan shadow-md rounded-lg p-6 bg-center">
      <h1 className="text-center text-2xl font-bold mb-4">Ajouter un dossier</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        {/* Patient selection */}
        <div className="mb-4">
          <label className="block text-lg font-bold mb-2">Patient</label>
          <select
            name="patient"
            value={dossier.patient}
            onChange={(e) => {
              const selectedPatient = patients.find((p) => p._id === e.target.value);
              const dateEntree = selectedPatient?.dateEntree;
              const formattedDate = dateEntree ? new Date(dateEntree).toISOString().split('T')[0] : '';
              setDossier({
                ...dossier,
                patient: e.target.value,
                numeroDossier: selectedPatient?.dossierMedical || '',
                diagnostic: dossier.diagnostic.map((diag) =>({
                  ...diag,
                  DateDiagnostic: formattedDate,
                })),
              });
            }}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Sélectionnez un patient --</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.nom}
              </option>
            ))}
          </select>
        </div>

        {/* DossierMedical */}
        <div className="mb-4">
          <label className="block text-lg font-bold mb-2">Dossier Médical</label>
          <input
            type="text"
            name="numDossier"
            value={dossier.numeroDossier}
            onChange={(e) => setDossier({ ...dossier, numeroDossier: e.target.value })}
            className="w-full border p-2 rounded"
            readOnly
            required
          />
        </div>

        {/* Diagnostic */}
        <div className="mb-5 pt-3">
          <label className="block text-center text-lg font-bold mb-5">Diagnostic</label>
          {dossier.diagnostic.map((diag, ind) => (
            <div key={ind} className="-mx-3 flex flex-wrap">
              <div className="w-full md:w-1/3 px-2">
                <div className="mb-4">
                  <label className="block text-sm mb-1">Note</label>
                  <input
                    type="text"
                    placeholder="Note"
                    name="note"
                    value={diag.note}
                    onChange={(e) => handleDiag(ind, "note", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
                    required
                  />
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2">
                <div className="mb-4">
                  <label className="block text-sm mb-1">Date</label>
                  <input
                    type="date"
                    placeholder="Date"
                    name="DateDiagnostic"
                    value={diag.DateDiagnostic}
                    onChange={(e) => handleDiag(ind, "DateDiagnostic", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
                    readOnly
                  />
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2">
                <div className="mb-4">
                  <label className="block text-sm mb-1">Indication</label>
                  <input
                    type="text"
                    placeholder="Indication"
                    name="indication"
                    value={diag.indication}
                    onChange={(e) => handleDiag(ind, "indication", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
                    required
                  />
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2">
                <div className="mb-4">
                  <label className="block text-sm mb-1">Test</label>
                  <input
                    type="text"
                    placeholder="Test à faire"
                    name="tests"
                    value={diag.tests.join(", ")}
                    onChange={(e) =>
                      handleDiag(ind, "tests", e.target.value.split(",").map((item) => item.trim()))
                    }
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
                    required
                  />
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2">
                <div className="mb-4">
                  <label className="block text-sm mb-1">Traitement</label>
                  <input
                    type="text"
                    placeholder="Traitement"
                    name="traitement"
                    value={diag.traitement}
                    onChange={(e) => handleDiag(ind, "traitement", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
                    required
                  />
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2">
                <div className="mb-4">
                  <label className="block text-sm mb-1">Type</label>
                  <select
                    value={diag.type}
                    onChange={(e) => handleDiag(ind, "type", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:shadow-md"
                    required
                  >
                    <option value="">Quel Type ?</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Intervention">Intervention</option>
                    <option value="Suivi">Suivi</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Submit Button */}
        <button
          type="submit"
          className="bg-cyan-500 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Envoi...' : 'Ajouter Dossier'}
        </button>
      </form>
    </div>
    </div>
  );
};

export default DossierForm;

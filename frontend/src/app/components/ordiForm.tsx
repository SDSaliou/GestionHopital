import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";


interface Medicament {
  nom: string;
  posologie: string;
  duree: string;
}

interface Patient {
  _id: string;
  nom: string;
  codePatient: string;
}

interface Personnel {
  _id: string;
  nom: string;
}

interface OrdonnanceFormProps {
  fetchOrdonnances: () => void;
}

const OrdonnanceForm: React.FC<OrdonnanceFormProps> = ({ fetchOrdonnances }) => {
  const [formData, setFormData] = useState({
    patient: '',
    codePatient: '',
    medecin: '',
    datePrescription: '',
    medicaments: [{ nom: '', posologie: '', duree: '' }],
    testsRecommandes: [''],
    remarques: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [patients, setPatients] = useState<Patient []>([]);
  const [personnels, setPersonnels] = useState<Personnel []>([]);

  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, personnelsRes] = await Promise.all([
          axios.get<Patient[]>('http://localhost:5000/patients'),
          axios.get('http://localhost:5000/personnels'),
        ]);
        const sortedPatients = patientsRes.data
        .sort((a, b) => a.nom.localeCompare(b.nom));
        setPatients(sortedPatients);
        setPersonnels(personnelsRes.data);
      } catch  {
        setError('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  const handleMedicamentChange = (index: number, field: keyof Medicament, value: string) => {
    const updatedMedicaments = [...formData.medicaments];
  
    
    if (!updatedMedicaments[index]) {
      console.error(`Aucun médicament trouvé à l'index ${index}.`);
      return;
    }
    
    if (typeof updatedMedicaments[index] !== 'object' || !(field in updatedMedicaments[index])) {
      console.error(`Le champ "${field}" n'est pas valide.`);
      return;
    }
    
    updatedMedicaments[index][field] = value;
  
    setFormData({ ...formData, medicaments: updatedMedicaments });
  };

  const handleAddMedicament = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      medicaments: [...prevFormData.medicaments, { nom: '', posologie: '', duree: '' }],
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTests = formData.testsRecommandes.filter((test) => test.trim() !== '');
    const cleanedFormData = { ...formData, testsRecommandes: cleanedTests };
  
    if (!cleanedFormData.patient || !cleanedFormData.medecin || cleanedFormData.medicaments.length === 0) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/ordonnance/add', formData);
      setSuccessMessage('Ordonnance ajoutée avec succès!');
      fetchOrdonnances(); 
      setFormData({
        patient: '',
        codePatient: '',
        medecin: '',
        datePrescription: '',
        medicaments: [{ nom: '', posologie: '', duree: '' }],
        testsRecommandes: [''],
        remarques: '',
      });
    } catch (err) {
      const errorResponse = err as AxiosError;
      setError((errorResponse.response?.data as { message: string })?.message || 'Erreur lors de l\'ajout de l\'ordonnance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-cyan shadow-md rounded-lg p-6 bg-center">
      <h1 className="text-2xl font-bold mb-4">Ajouter une Ordonnance</h1>

      {successMessage && <div className="mb-4 p-4 text-green-600 bg-green-100 rounded">{successMessage}</div>}
      {error && <div className="mb-4 p-4 text-red-600 bg-red-100 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
  {/* Patient selection */}
  <div className="mb-4">
    <label className="block text-lg font-bold mb-2">Patient</label>
    <select
      name="patient"
      value={formData.patient}
      onChange={(e) => {
        const selectedPatient = patients.find((p) => p._id === e.target.value);
        setFormData({
          ...formData,
          patient: e.target.value,
          codePatient: selectedPatient?.codePatient || '',
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

  {/* Code Patient */}
  <div className="mb-4">
    <label className="block text-lg font-bold mb-2">Code Patient</label>
    <input
      type="text"
      name="codePatient"
      value={formData.codePatient}
      onChange={(e) => setFormData({ ...formData, codePatient: e.target.value })}
      className="w-full border p-2 rounded"
      readOnly
      required
    />
  </div>

  {/* Médecin */}
  <div className="mb-4">
    <label className="block text-lg font-bold mb-2">Médecin</label>
    <select
      name="medecin"
      value={formData.medecin}
      onChange={(e) => setFormData({ ...formData, medecin: e.target.value })}
      className="w-full border p-2 rounded"
      required
    >
      <option value="">-- Sélectionnez un médecin --</option>
      {personnels.map((personnel) => (
        <option key={personnel._id} value={personnel._id}>
          {personnel.nom}
        </option>
      ))}
    </select>
  </div>

  {/* Médicaments */}
  <div className="mb-4">
    <label className="block text-lg font-bold text-cyan mb-2">Médicaments</label>
    {formData.medicaments.map((med, index) => (
      <div key={index} className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Nom"
          value={med.nom}
          onChange={(e) => handleMedicamentChange(index, 'nom', e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
        <input
          type="text"
          placeholder="Posologie"
          value={med.posologie}
          onChange={(e) => handleMedicamentChange(index, 'posologie', e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
        <input
          type="text"
          placeholder="Durée"
          value={med.duree}
          onChange={(e) => handleMedicamentChange(index, 'duree', e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
      </div>
    ))}
    <button
      type="button"
      onClick={handleAddMedicament}
      className="bg-cyan-700 text-white px-4 py-2 rounded"
    >
      Ajouter un Médicament
    </button>
  </div>

  {/* Date Prescription */}
  <div className="mb-4">
    <label className="block text-lg font-bold mb-2">Date Prescription</label>
    <input
      type="date"
      name="datePrescription"
      value={formData.datePrescription}
      onChange={(e) => setFormData({ ...formData, datePrescription: e.target.value })}
      className="w-full border p-2 rounded"
      required
    />
  </div>

  {/* Tests Recommandés */}
  <div className="mb-4">
    <label className="block text-lg font-bold mb-2">Tests Recommandés</label>
    {formData.testsRecommandes.map((test, index) => (
      <div key={index} className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Test"
          value={test}
          onChange={(e) => {
            const updatedTests = [...formData.testsRecommandes];
            updatedTests[index] = e.target.value;
            setFormData({ ...formData, testsRecommandes: updatedTests });
          }}
          className="border p-2 rounded flex-1"
          required
        />
      </div>
    ))}
    <button
      type="button"
      onClick={() => setFormData({ ...formData, testsRecommandes: [...formData.testsRecommandes, ''] })}
      className="bg-cyan-700 text-white px-4 py-2 rounded"
    >
      Ajouter un Test
    </button>
  </div>

  {/* Remarques */}
  <div className="mb-4">
    <label className="block text-lg font-bold mb-2">Remarques</label>
    <textarea
      name="remarques"
      value={formData.remarques}
      onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
      className="w-full border p-2 rounded"
      placeholder="Ajoutez des remarques"
      rows={4}
    />
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    className="bg-cyan-500 text-white px-6 py-2 rounded"
    disabled={loading}
  >
    {loading ? 'Envoi...' : 'Ajouter l\'Ordonnance'}
  </button>
</form>
</div>
    </div>
  );
};

export default OrdonnanceForm;

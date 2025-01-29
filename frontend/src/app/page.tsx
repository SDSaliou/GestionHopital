import React from "react";
import Link from "next/link";


const HomePage: React.FC = () => {
  return (
    <div
      className="bg-blue-50 bg-cover bg-center min-h-screen"
      style={{
        backgroundImage: "url('/Logo.PNG')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
     

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-semibold text-blue-900 leading-tight">
          Gestion hospitalière pour le personnel
        </h1>
        <p className="mt-4 text-base sm:text-lg text-blue-800 leading-6 sm:px-16">
          Un système complet pour gérer le personnel hospitalier, les dossiers des patients, les rendez-vous, les hospitalisations, et bien plus.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <button className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
              Connexion
            </button>
          </Link>
        </div>
      </section>

      {/* Horizontal Sections */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Administration */}
          <div className="flex flex-col bg-blue-100 p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Administration</h2>
            <p className="mt-2 text-sm text-blue-800">
              Gérer les membres du personnel, leurs rôles, et les départements.
            </p>
          </div>

          {/* Médecins */}
          <div className="flex flex-col bg-blue-100 p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Médecins</h2>
            <p className="mt-2 text-sm text-blue-800">
              Gérer les dossiers des patients, les rendez-vous et les hospitalisations.
            </p>
          </div>

          {/* Réception */}
          <div className="flex flex-col bg-blue-100 p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Réception</h2>
            <p className="mt-2 text-sm text-blue-800">
              Organiser les rendez-vous, les admissions, et gérer les données des patients.
            </p>
          </div>

          {/* Laboratoire */}
          <div className="flex flex-col bg-blue-100 p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Laboratoire</h2>
            <p className="mt-2 text-sm text-blue-800">
              Effectuer des analyses médicales et transmettre les résultats.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
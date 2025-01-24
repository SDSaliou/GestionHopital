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
      {/* Header */}
      <header className="mx-auto max-w-screen-xl px-6 lg:px-8 relative">
        <div className="relative flex h-16 space-x-10 w-full">
          <div className="flex justify-start">
            <Link className="flex flex-shrink-0 items-center" href="/">
              <img
                className="block h-8 w-auto rounded-full object-cover"
                height="32"
                src="/Logo.PNG"
                alt="Logo"
              />
            </Link>
          </div>
          <div className="flex-shrink-0 flex px-2 py-3 items-center space-x-8 flex-1 justify-end">
            <Link className="text-white hover:text-blue-900 text-sm font-medium" href="#admin">
              Administration
            </Link>
            <Link className="text-white hover:text-blue-900 text-sm font-medium" href="#doctors">
              Médecins
            </Link>
            <Link className="text-white hover:text-blue-900 text-sm font-medium" href="#reception">
              Réception
            </Link>
            <Link className="text-white hover:text-blue-900 text-sm font-medium" href="#laboratory">
              Laboratoire
            </Link>
            <Link
              className="text-white bg-blue-800 hover:bg-blue-900 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm"
              href="/login"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto relative py-16 px-4 sm:px-0 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold text-blue-900 xl:text-6xl font-serif !leading-tight">
          Gestion hospitalière pour le personnel
        </h1>
        <p className="mt-4 text-lg sm:text-xl leading-8 text-blue-800 sm:px-16">
          Un système complet pour gérer le personnel hospitalier, les dossiers des patients, les rendez-vous, les hospitalisations, et bien plus.
        </p>
        <div className="mt-8 flex w-full space-x-8 justify-center">
          <a href="#admin">
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none ring-2 ring-offset-2 ring-transparent ring-offset-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
              WERRAL AK DIAM
            </button>
          </a>
        </div>
      </section>

      {/* Horizontal Sections */}
      <section className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Administration */}
          <div className="flex flex-col bg-blue-100 p-4 rounded-md shadow-md">
            <h2 className="text-xl font-semibold text-blue-900">Administration</h2>
            <p className="mt-2 text-sm text-blue-800">
              Gérer les membres du personnel, leurs rôles, et les départements.
            </p>
          </div>

          {/* Médecins */}
          <div className="flex flex-col bg-blue-100 p-4 rounded-md shadow-md">
            <h2 className="text-xl font-semibold text-blue-900">Médecins</h2>
            <p className="mt-2 text-sm text-blue-800">
              Gérer les dossiers des patients, les rendez-vous et les hospitalisations.
            </p>
          </div>

          {/* Réception */}
          <div className="flex flex-col bg-blue-100 p-4 rounded-md shadow-md">
            <h2 className="text-xl font-semibold text-blue-900">Réception</h2>
            <p className="mt-2 text-sm text-blue-800">
              Organiser les rendez-vous, les admissions, et gérer les données des patients.
            </p>
          </div>

          {/* Laboratoire */}
          <div className="flex flex-col bg-blue-100 p-4 rounded-md shadow-md">
            <h2 className="text-xl font-semibold text-blue-900">Laboratoire</h2>
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

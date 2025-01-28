import React from "react";
import Link from "next/link";
import Image from "next/image";

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
      <header className="mx-auto max-w-screen-xl  px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex justify-start">
            <Link className="flex items-center" href="/">
              <Image
                className="block h-8 w-auto rounded-full object-cover"
                height={32}
                width={32}
                src="/Logo.PNG"
                alt="Logo"
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#admin" className="text-white hover:text-blue-900 text-sm font-medium">
              Administration
            </Link>
            <Link href="#doctors" className="text-white hover:text-blue-900 text-sm font-medium">
              Médecins
            </Link>
            <Link href="#reception" className="text-white hover:text-blue-900 text-sm font-medium">
              Réception
            </Link>
            <Link href="#laboratory" className="text-white hover:text-blue-900 text-sm font-medium">
              Laboratoire
            </Link>
            <Link
              href="/login"
              className="text-white bg-blue-800 hover:bg-blue-900 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md shadow-sm"
            >
              Se connecter
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-semibold text-blue-900 leading-tight">
          Gestion hospitalière pour le personnel
        </h1>
        <p className="mt-4 text-base sm:text-lg text-blue-800 leading-6 sm:px-16">
          Un système complet pour gérer le personnel hospitalier, les dossiers des patients, les rendez-vous, les hospitalisations, et bien plus.
        </p>
        <div className="mt-8">
          <a href="#admin">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              WERRAL AK DIAM
            </button>
          </a>
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
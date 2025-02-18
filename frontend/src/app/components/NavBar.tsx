"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // Icônes pour le menu

interface NavLink {
  label: string;
  path: string;
}

interface NavBarProps {
  sidebarTitle: NavLink[];
  buttonLinks: { label: string; path: string; onClick?: () => void }[];
  children: React.ReactNode;
}

const NavBar: React.FC<NavBarProps> = ({ sidebarTitle, buttonLinks, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fonction pour basculer l'état du menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen bg-cyan-500">
      {/* Sidebar pour écran large */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-cyan-500 p-4 flex flex-col gap-6 transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0 md:flex`}>
        <div className="text-center text-white font-bold text-lg">Liste des tâches</div>
        <nav className="flex flex-col gap-4">
          {sidebarTitle.map((link, index) => (
            <Link
              key={index}
              href={link.path}
              className="block px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-400 rounded-md"
              onClick={() => setIsOpen(false)} // Ferme le menu en mobile après clic
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Bouton Menu pour mobile */}
      <button 
        onClick={toggleMenu} 
        className="md:hidden fixed top-4 left-4 z-20 bg-cyan-700 text-white p-2 rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all">
        {/* Top Navigation */}
        <header className="bg-cyan-500 text-white py-4 px-6 flex justify-between items-center fixed top-0 left-0 w-full md:left-64 md:w-[calc(100%-16rem)] z-10">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Link href="/" aria-label="Home">
              <Image
                src="/Logo.PNG"
                height={32}
                width={32}
                alt="Logo"
                className="block h-8 w-auto rounded-full object-cover"
              />
            </Link>
            WERAL AK DIAM
          </h1>
          <div className="flex gap-4">
            {buttonLinks.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="bg-cyan-900 hover:bg-cyan-400 px-4 py-2 rounded-md text-white"
              >
                {action.label}
              </button>
            ))}
          </div>
        </header>

        {/* Contenu dynamique */}
        <main className="p-6 mt-16 bg-[url('/Logo.PNG')] bg-cover bg-center bg-no-repeat">
          {children}
        </main>
      </div>
    </div>
  );
};

export default NavBar;

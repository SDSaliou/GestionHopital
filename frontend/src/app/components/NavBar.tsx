"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";


// Définir les types pour les props
interface NavLink {
  label: string;
  path: string;
}

interface NavBarProps {
  sidebarTitle:NavLink[]; 
  buttonLinks:{ label: string; path: string; onClick?: () => void }[]; 
  children: React.ReactNode;
}

const NavBar: React.FC<NavBarProps> = ({ sidebarTitle, buttonLinks, children }) => {
    return(
      <div className="flex min-h-screen bg-cyan-500">
            {/* Sidebar */}
        <aside className="w-64 bg-cyan-500 p-4 flex flex-col gap-6 fixed top-0 left-0 h-screen">
            <div className="text-center text-white font-bold text-lg">Liste des taches</div>
            <nav className="flex flex-col gap-4">
            {sidebarTitle.map((link, index) =>(
             <Link
             key={index}
             href={link.path}
             className="block px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-400 rounded-md"
             >
                {link.label}
             </Link>   
            ))}
            </nav>
        </aside>
        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
                {/* Top Navigation */}
                <header className="bg-cyan-500 text-white py-4 px-6 flex justify-between items-center fixed top-0 left-64 w-[calc(100%-16rem)] z-10">
                <h1 className="text-lg font-bold">{/* Logo */}
            
                  <Link href="/" aria-label="Home">
                    <Image
                      src="/Logo.PNG"
                      height={32}
                      width={32}
                      alt="Logo"
                      className="block h-8 w-auto rounded-full object-cover"
                    />
                  </Link>
                WERAL AK DIAM</h1>
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

            {/* Dynamic Content */}
            <main className="p-6 bg-[url('/Logo.PNG')] bg-cover bg-center bg-no-repeat ">
              {/* Enfants passés par le Layout */}
              {children}
            </main>
          </div>
      </div>
    );
};

export default NavBar;
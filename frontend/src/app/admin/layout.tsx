"use client";

import React, { ReactNode, useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation"; // ✅ Utilisation de useRouter()

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter(); // ✅ Utilisation de useRouter pour la navigation
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [adminDetails, setAdminDetails] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (typeof window === "undefined") return;

            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
                setError("Utilisateur non authentifié. Veuillez vous connecter.");
                setLoading(false);
                return;
            }

            try {
                const { data } = await axios.get(
                    `https://gestion-hopital-api.vercel.app/personnels/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (typeof data.nom === "string") {
                    setAdminDetails(data.nom);
                } else {
                    throw new Error("Format de données inattendu pour 'nom'");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des détails :", error);
                setError("Impossible de récupérer les détails de l'utilisateur.");
                toast.error("Erreur lors de la récupération des données.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    // ✅ Gestion du logout avec useRouter()
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        router.push("/login"); // ✅ Redirection plus fluide
    };

    // ✅ Fonction pour recharger la page en cas d'erreur
    const reloadPage = () => {
        setLoading(true);
        setError("");
        setAdminDetails(null);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold text-gray-700">Chargement...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <p className="text-red-500 text-lg">{error}</p>
                <Link href="/login" className="text-blue-500 underline mt-4">
                    Veuillez vous connecter
                </Link>
                <button 
                    onClick={reloadPage} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!adminDetails) {
        return (
            <div className="flex items-center justify-center h-screen text-center">
                <p className="text-red-500 text-lg">Détails utilisateur introuvables.</p>
            </div>
        );
    }

    return (
        <NavBar
            sidebarTitle={[
                { label: "Liste du personnel", path: "/admin/Personnel" },
                { label: "Ajout personnel", path: "/admin/add" },
            ]}
            buttonLinks={[
                { label: adminDetails || "Profil", path: "/admin/Personnel" },
                { label: "Déconnexion", path: "/login", onClick: handleLogout },
            ]}
        >
            <div className="p-4">{children}</div> {/* ✅ Ajout d'un padding pour éviter que le contenu touche les bords */}
        </NavBar>
    );
};

export default Layout;

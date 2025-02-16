"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage: React.FC = () => {
    const [nom, setNom] = useState("");
    const [password, setPassword] = useState("");
    const [services, setServices] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const validateForm = () => {
        if (!nom || !password) {
            setError("Veuillez renseigner le nom et le mot de passe.");
            return false;
        }
    
        if (!services) {
            setError("Veuillez sélectionner un service.");
            return false;
        }
    
        return true;
    };
    

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
    
        if (!validateForm()) return;
    
        setIsLoading(true);
    
        try {
            
            const res = await axios.post("https://gestion-hopital-api.vercel.app/personnels/login", {
                nom,
                password,
                services,
            });
    
           
            if (res.data.token) {
                
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.id);
                localStorage.setItem("service", res.data.services);
    
                
                if (res.data.services !== services) {
                    setError("Le service sélectionné ne correspond pas à votre rôle !");
                    return;
                }
    
                
                const routeMap: Record<string, string> = {
                    Medecin: "/medecin/Rv",
                    Receptionniste: "/receptionniste/RvAdd",
                    Admin: "/admin/Personnel",
                };
    
                
                router.push(routeMap[res.data.services] || "/");
                } else {
                setError("Identifiants incorrects");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data);
                setError(
                    error.response?.data?.message ||
                    "Une erreur est survenue, veuillez réessayer."
                );
            } else {
                setError("Erreur inconnue, veuillez réessayer.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const service = localStorage.getItem("service");

        if (token && userId && service) {
            console.log("Utilisateur connecté, récupération des détails...");
        }
    }, []);

    return (
        <div className="min-h-screen bg-[url('/Logo.PNG')] bg-cover bg-no-repeat bg-center flex flex-col justify-center items-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm space-y-6"
            >
                <h1 className="text-2xl font-bold text-gray-700 text-center">Connexion</h1>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <div className="space-y-2">
                    <label className="block text-gray-600 font-medium">Nom</label>
                    <input
                        type="text"
                        placeholder="Entrez votre nom"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-600 font-medium">Mot de passe</label>
                    <input
                        type="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-600 font-medium">Service</label>
                    <select
                        value={services}
                        onChange={(e) => setServices(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Sélectionnez un service</option>
                        <option value="Medecin">Médecin</option>
                        <option value="Receptionniste">Réceptionniste</option>
                        <option value="Admin">Administrateur</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-300 flex justify-center items-center"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    ) : (
                        "Se connecter"
                    )}
                </button>

                <div className="text-center mt-4">
                    <Link href="/login/password" className="text-blue-500 hover:underline">
                        Mot de passe oublié ?
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;

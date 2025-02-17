"use client"

import React, { useState } from "react";
import axios from "axios";
import {useRouter} from "next/navigation";

const ResetPasswordPage: React.FC = () => {
  const [codePersonnel, setCodePersonnel] = useState("");
  const [password, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); 
    setError("");

    try {
      const res = await axios.post("https://gestion-hopital-api.vercel.app/personnels/reset-password", {
        codePersonnel,
        password,
      });
      router.push("/login");

      setMessage(res.data.message);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-400">
      
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-700 text-center">Réinitialisation du mot de passe</h1>

        {message && <p className="text-center text-gray-700">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="space-y-2">
          <label className="block text-gray-600 font-medium">Code Personnel</label>
          <input
            type="text"
            placeholder="Entrez votre code personnel"
            value={codePersonnel}
            onChange={(e) => setCodePersonnel(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-gray-600 font-medium">Nouveau mot de passe</label>
          <input
            type="password"
            placeholder="Entrez votre nouveau mot de passe"
            value={password}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-300"
        >
          {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;

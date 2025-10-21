"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import React from "react";

// Typage de la position utilisateur
interface UserPosition {
  lat: number;
  lng: number;
}

// Chargement dynamique de la carte (sans SSR)
const CarteMadagascar = dynamic<{ userPosition: UserPosition | null }>(
  () => import("@/components/map/CarteMadagascar"),
  {
    ssr: false,
    loading: () => <p>Chargement de la carte...</p>,
  }
);

export default function HomePage() {
  // État pour stocker la position de l'utilisateur
  const [userLocation, setUserLocation] = useState<UserPosition | null>(null);
  // NOUVEAU : États pour les dates du voyage
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Effet pour demander la position de l'utilisateur au chargement de la page
  useEffect(() => {
    // On vérifie si le navigateur supporte la géolocalisation
    if (!navigator.geolocation) {
      console.error(
        "La géolocalisation n'est pas supportée par votre navigateur."
      );
      return;
    }

    // On demande la position actuelle
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // En cas de succès, on met à jour l'état avec les coordonnées
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // En cas d'erreur, on l'affiche dans la console
        console.error("Erreur de géolocalisation:", error.message);
      }
    );
  }, []); // Le tableau vide [] assure que cet effet ne s'exécute qu'une seule fois

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">
          Découvrez les Merveilles de Madagascar
        </h1>
        <p className="mt-2 text-gray-700">Votre guide de voyage interactif.</p>

        {/* NOUVEAU : Sélecteurs de dates */}
        <div className="mt-6 flex justify-center items-center gap-4">
          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700"
            >
              Date de départ
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md text-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-gray-700"
            >
              Date de retour
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md text-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </header>

      <section className="w-full max-w-4xl">
        <CarteMadagascar userPosition={userLocation} />
      </section>
    </main>
  );
}

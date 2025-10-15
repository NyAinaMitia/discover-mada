"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import React from "react";

// Typage de la position utilisateur
interface UserPosition {
  lat: number;
  lng: number;
}

// Chargement dynamique de la carte (sans SSR)
const CarteMadagascar = dynamic<{ userPosition: UserPosition | null }>(
  () => import("@/components/CarteMadagascar"),
  {
    ssr: false,
    loading: () => <p>Chargement de la carte...</p>,
  }
);

export default function HomePage() {
  // État pour la position de l'utilisateur
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);

  // Fonction pour récupérer la position de l'utilisateur
  const handleFindMe = (): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          alert("Impossible d'obtenir votre position : " + error.message);
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">
          Découvrez les Merveilles de Madagascar
        </h1>
        <p className="mt-2 text-gray-700">Votre guide de voyage interactif.</p>
      </header>

      {/* Bouton pour activer la géolocalisation */}
      <button
        onClick={handleFindMe}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        📍 Me localiser
      </button>

      <section className="w-full max-w-4xl">
        {/* On passe la position de l'utilisateur à la carte */}
        <CarteMadagascar userPosition={userPosition} />
      </section>
    </main>
  );
}

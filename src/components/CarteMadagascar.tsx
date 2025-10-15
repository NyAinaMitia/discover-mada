"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { sitesTouristiques, SiteTouristique } from "@/donnees";
import { supabase } from "@/lib/supabase";
import React from "react";

// --- Correction importante pour les icônes Leaflet ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Icône rouge personnalisée
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function CarteMadagascar() {
  // IDs des sites sélectionnés
  const [selectedSiteIds, setSelectedSiteIds] = useState<number[]>([]);

  // Récupération des sites sélectionnés depuis Supabase
  const fetchSelectedSites = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("voyages_selectionnes")
      .select("site_id");

    if (error) {
      console.error("Erreur lors de la récupération:", error);
    } else if (data) {
      const ids = data.map((item: { site_id: number }) => item.site_id);
      setSelectedSiteIds(ids);
    }
  };

  useEffect(() => {
    fetchSelectedSites();
  }, []);

  // Insertion en base de données
  const handleAddToTrip = async (site: SiteTouristique): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("voyages_selectionnes")
        .insert([{ site_id: site.id }]);

      if (error) {
        console.error("Erreur Supabase:", error);
        alert("Une erreur est survenue. Vérifiez la console.");
      } else {
        alert(`"${site.nom}" a été ajouté à votre voyage !`);
        console.log("Données insérées:", data);
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      alert("Une erreur inattendue est survenue.");
    }
  };

  return (
    <MapContainer
      center={[-20.0, 47.0]}
      zoom={6}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {sitesTouristiques.map((site) => (
        <Marker
          key={site.id}
          position={[site.latitude, site.longitude]}
          icon={
            selectedSiteIds.includes(site.id)
              ? redIcon // Si déjà sélectionné, icône rouge
              : new L.Icon.Default()
          }
        >
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-bold text-lg">{site.nom}</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">
                {site.description}
              </p>
              <button
                onClick={() => handleAddToTrip(site)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Ajouter à mon voyage
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

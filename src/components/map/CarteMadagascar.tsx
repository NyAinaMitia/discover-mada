"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet"; // NOUVEAU
import "leaflet/dist/leaflet.css";
import { sitesTouristiques } from "@/data/sites";
import { Site } from "@/types";

// --- Correction importante pour les icônes Leaflet ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Icône par défaut (pour les sites non sélectionnés)
const defaultIcon = new L.Icon.Default();

// Icône rouge pour la destination choisie
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

// Icône verte pour la position de l'utilisateur
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// On définit le type pour la position utilisateur pour plus de clarté
interface UserPosition {
  lat: number;
  lng: number;
}

// Le composant reçoit maintenant la position de l'utilisateur en prop
export default function CarteMadagascar({
  userPosition,
}: {
  userPosition: UserPosition | null;
}) {
  // État pour stocker l'ID de la SEULE destination choisie
  const [selectedDestinationId, setSelectedDestinationId] = useState<
    number | null
  >(null);

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );

  // NOUVEAU : États pour la distance et la durée du trajet
  const [routeDistance, setRouteDistance] = useState<number | null>(null); // en mètres
  const [routeDuration, setRouteDuration] = useState<number | null>(null); // en secondes

  // Fonction pour sélectionner une destination
  const handleSelectDestination = (siteId: number) => {
    setSelectedDestinationId(siteId);

    // On trouve les coordonnées du site choisi
    const destination = sitesTouristiques.find((s) => s.id === siteId);

    // Si on a la position de l'utilisateur et une destination, on cherche la route
    if (userPosition && destination) {
      // On crée un objet avec les bons noms de propriétés pour fetchRoute
      const destinationForRoute = {
        lat: destination.latitude,
        lng: destination.longitude,
      };
      fetchRoute(userPosition, destinationForRoute);
    }
  };

  // NOUVEAU : Fonction pour récupérer l'itinéraire routier depuis l'API OSRM
  const fetchRoute = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) => {
    try {
      // On construit l'URL pour l'API OSRM
      const url = `http://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      // On vérifie si l'API a trouvé un itinéraire
      if (data && data.routes && data.routes.length > 0) {
        const route = data.routes[0]; // On stocke la route pour plus de clarté
        const coordinates = route.geometry.coordinates;
        const routeForLeaflet = coordinates.map((coord: [number, number]) => [
          coord[1],
          coord[0],
        ]);

        // NOUVEAU : On extrait la distance et la durée
        setRouteDistance(route.distance); // en mètres
        setRouteDuration(route.duration); // en secondes

        setRouteCoordinates(routeForLeaflet);
      } else {
        console.error("Aucun itinéraire trouvé.");
        // On remet tout à zéro si aucun itinéraire n'est trouvé
        setRouteCoordinates([]);
        setRouteDistance(null);
        setRouteDuration(null);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API OSRM:", error);
      // On remet tout à zéro en cas d'erreur
      setRouteCoordinates([]);
      setRouteDistance(null);
      setRouteDuration(null);
    }
  };

  // On trouve les coordonnées de la destination choisie
  const selectedDestination = sitesTouristiques.find(
    (site) => site.id === selectedDestinationId
  );

  // On prépare les positions pour la ligne (de l'utilisateur vers la destination)
  const polylinePositions: LatLngExpression[] =
    userPosition && selectedDestination
      ? [
          [userPosition.lat, userPosition.lng],
          [selectedDestination.latitude, selectedDestination.longitude],
        ]
      : [];

  return (
    <>
      <MapContainer
        center={[-20.0, 47.0]}
        zoom={6}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Marqueurs pour les sites touristiques */}
        {sitesTouristiques.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            icon={site.id === selectedDestinationId ? redIcon : defaultIcon}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold text-lg">{site.nom}</h3>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  {site.description}
                </p>
                <button
                  onClick={() => handleSelectDestination(site.id)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  {site.id === selectedDestinationId
                    ? "Destination choisie"
                    : "Choisir comme destination"}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marqueur pour la position de l'utilisateur */}
        {userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
            icon={greenIcon}
          >
            <Popup>
              <p className="text-center font-semibold">Vous êtes ici</p>
            </Popup>
          </Marker>
        )}

        {/* Ligne entre l'utilisateur et la destination */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: "blue", weight: 4 }}
          />
        )}
      </MapContainer>

      {/* NOUVEAU : Panneau d'information sur l'itinéraire */}
      {routeDistance !== null && routeDuration !== null && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Informations sur le trajet
          </h3>
          <div className="flex justify-around text-sm text-gray-600">
            <div>
              <p className="font-bold text-blue-600">
                {(routeDistance / 1000).toFixed(1)} km
              </p>
              <p>Distance</p>
            </div>
            <div>
              <p className="font-bold text-blue-600">
                {Math.floor(routeDuration / 60)} min
              </p>
              <p>Durée estimée</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

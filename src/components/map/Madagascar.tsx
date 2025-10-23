import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// @ts-ignore
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface UserPosition {
  lat: number;
  lng: number;
}

interface Restaurant {
  id: number;
  nom_restaurant: string;
  latitude: number;
  longitude: number;
  ville: string;
}

const restaurantIcon = new L.Icon({
  iconUrl: "restau.png", // place ton icône dans /public/icons/
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function CarteMadagascar({ userPosition }: { userPosition: UserPosition | null }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // ✅ Charger les restaurants depuis Supabase
  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase
        .from("restaurant")
        .select("id_restaurant, nom_restaurant, ville, latitude, longitude");

      if (error) {
        console.error("Erreur lors du chargement des restaurants :", error);
      } else {
        // map Supabase rows to the local Restaurant type
        const mapped: Restaurant[] = (data || []).map((row: any) => ({
          id: row.id_restaurant,
          nom_restaurant: row.nom_restaurant,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          ville: row.ville,
        }));
        setRestaurants(mapped);
      }
    };

    fetchRestaurants();
  }, []);

  // 📍 Centre sur Madagascar
  const center = [-18.7669, 46.8691]; // coordonnées du centre de Madagascar
  const zoom = 6;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={6}
      maxZoom={13}
      style={{ height: "600px", width: "100%", borderRadius: "10px" }}
      maxBounds={[
        [-26.0, 42.0], // sud-ouest
        [-11.5, 51.0], // nord-est
      ]}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />

      {/* 📍 Position utilisateur (si dispo) */}
      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]}>
          <Popup>📍 Vous êtes ici</Popup>
        </Marker>
      )}

      {/* 🍽️ Marqueurs pour les restaurants */}
      {restaurants.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} {...({ icon: restaurantIcon } as any)}>
          <Popup>
            <b>{r.nom_restaurant}</b> <br />
            {r.ville}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

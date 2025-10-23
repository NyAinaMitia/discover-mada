"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Restaurant {
  id_restaurant: number;
  nom_restaurant: string;
  ville: string;
  type_cuisine: string;
  prix_moyen: number;
  latitude: number;
  longitude: number;
  created_at: string;
}

export default function RestaurantPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [formData, setFormData] = useState({
    nom_restaurant: "",
    ville: "",
    type_cuisine: "",
    prix_moyen: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);

  // 📥 Récupération des restaurants
  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from("restaurant")
      .select("*")
      .order("id_restaurant", { ascending: false });
    if (error) console.error("Erreur de récupération:", error);
    else setRestaurants(data || []);
  };

  // 🧾 Ajout d’un restaurant
  const addRestaurant = async () => {
    setLoading(true);
    const { error } = await supabase.from("restaurant").insert([{
      nom_restaurant: formData.nom_restaurant,
      ville: formData.ville,
      type_cuisine: formData.type_cuisine,
      prix_moyen: Number(formData.prix_moyen),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    }]);
    setLoading(false);
    if (error) console.error("Erreur d’ajout:", error);
    else {
      setFormData({ nom_restaurant: "", ville: "", type_cuisine: "", prix_moyen: "", latitude: "", longitude: "" });
      fetchRestaurants();
    }
  };

    // ❌ Suppression d’un restaurant
    const deleteRestaurant = async (id_restaurant: number) => {
      console.log("Suppression demandée pour id =", id_restaurant);
      const { error } = await supabase.from("restaurant").delete().eq("id_restaurant", id_restaurant);
      if (error) console.error("Erreur de suppression:", error);
      else fetchRestaurants();
    };

    const editRestaurant = async (id_restaurant: number) => {
      // Logique de modification à implémenter
      console.log("Modification demandée pour id =", id_restaurant);
    };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🍽️ Gestion des Restaurants</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nom du restaurant"
          value={formData.nom_restaurant}
          onChange={(e) => setFormData({ ...formData, nom_restaurant: e.target.value })}
        />
        <input
          placeholder="Ville"
          value={formData.ville}
          onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
        />
        <input
          placeholder="Type de cuisine"
          value={formData.type_cuisine}
          onChange={(e) => setFormData({ ...formData, type_cuisine: e.target.value })}
        />
        <input
          placeholder="Prix moyen"
          type="number"
          value={formData.prix_moyen}
          onChange={(e) => setFormData({ ...formData, prix_moyen: e.target.value })}
        />
        <input
          placeholder="Latitude"
          type="number"
          value={formData.latitude}
          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
        />
        <input
          placeholder="Longitude"
          type="number"
          value={formData.longitude}
          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
        />
        <button onClick={addRestaurant} disabled={loading}>
          {loading ? "Ajout..." : "Ajouter"}
        </button>
      </div>

      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Ville</th>
            <th>Type</th>
            <th>Prix moyen</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((r, index) => (
            <tr key={r.id_restaurant ?? index}>
              <td>{r.nom_restaurant}</td>
              <td>{r.ville}</td>
              <td>{r.type_cuisine}</td>
              <td>{r.prix_moyen}</td>
              <td>{r.latitude}</td>
              <td>{r.longitude}</td>
              <td>
                <button onClick={() => deleteRestaurant(r.id_restaurant)}>🗑️ Supprimer</button>
                <button onClick={() => editRestaurant(r.id_restaurant)}>// Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

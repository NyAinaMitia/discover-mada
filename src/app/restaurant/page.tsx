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
  const [formData, setFormData] = useState<Omit<Restaurant, "id_restaurant">>({
    nom_restaurant: "",
    ville: "",
    type_cuisine: "",
    prix_moyen: 0,
    latitude: 0,
    longitude: 0,
    created_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // 📥 Récupération des restaurants
  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from("restaurant")
      .select("*")
      .order("id_restaurant", { ascending: true });
    if (error) console.error("Erreur de récupération:", error);
    else setRestaurants(data || []);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // 🧾 Ajout d’un restaurant
  // const addRestaurant = async () => {
  //   setLoading(true);
  //   const { error } = await supabase.from("restaurant").insert([{
  //     nom_restaurant: formData.nom_restaurant,
  //     ville: formData.ville,
  //     type_cuisine: formData.type_cuisine,
  //     prix_moyen: Number(formData.prix_moyen),
  //     latitude: Number(formData.latitude),
  //     longitude: Number(formData.longitude),
  //   }]);
  //   setLoading(false);
  //   if (error) console.error("Erreur d’ajout:", error);
  //   else {
  //     setFormData({ nom_restaurant: "", ville: "", type_cuisine: "", prix_moyen:0 , latitude: 0, longitude: 0, created_at: "" });
  //     fetchRestaurants();
  //   }
  // };

  // Ajouter ou modifier
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRestaurant) {
      // 🟡 Mode édition : UPDATE
      const { error } = await supabase
        .from("restaurant")
        .update(formData)
        .eq("id_restaurant", editingRestaurant.id_restaurant);

      if (error) console.error("Erreur lors de la modification :", error);
      else {
        setEditingRestaurant(null);
        setFormData({ nom_restaurant: "", ville: "", type_cuisine: "", prix_moyen: 0, latitude: 0, longitude: 0, created_at: "" });
        alert(editingRestaurant ? "✅ Restaurant modifié avec succès !" : "✅ Restaurant ajouté avec succès !");
        fetchRestaurants();
      }
    } else {
      // 🟢 Mode ajout : INSERT
      const { error } = await supabase.from("restaurant").insert([formData]);
      if (error) console.error("Erreur d’ajout :", error);
      else {
        setFormData({ nom_restaurant: "", ville: "", type_cuisine: "", prix_moyen: 0, latitude: 0, longitude: 0, created_at: "" });
        alert(editingRestaurant ? "✅ Restaurant modifié avec succès !" : "✅ Restaurant ajouté avec succès !");
        fetchRestaurants();
      }
    }
  };

    // ❌ Suppression d’un restaurant
    const deleteRestaurant = async (id_restaurant: number) => {
      console.log("Suppression demandée pour id =", id_restaurant);
      const { error } = await supabase.from("restaurant").delete().eq("id_restaurant", id_restaurant);
      if (error) console.error("Erreur de suppression:", error);
      else fetchRestaurants();
    };

    // Modifier (charger les données dans le formulaire)
  const editRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      nom_restaurant: restaurant.nom_restaurant,
      ville: restaurant.ville,
      type_cuisine: restaurant.type_cuisine,
      prix_moyen: restaurant.prix_moyen,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      created_at: restaurant.created_at,
    });
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

 return (
    <div style={{ padding: "20px" }}>
      <h1>🍽️ Gestion des Restaurants</h1>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nom du restaurant"
          value={formData.nom_restaurant}
          onChange={(e) => setFormData({ ...formData, nom_restaurant: e.target.value })}
        />
        <input
          type="text"
          placeholder="Ville"
          value={formData.ville}
          onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
        />
        <input
          type="text"
          placeholder="Type de cuisine"
          value={formData.type_cuisine}
          onChange={(e) => setFormData({ ...formData, type_cuisine: e.target.value })}
        />
        <input
          type="number"
          placeholder="Prix moyen"
          value={formData.prix_moyen}
          onChange={(e) => setFormData({ ...formData, prix_moyen: Number(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Latitude"
          value={formData.latitude}
          onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={formData.longitude}
          onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
        />
        <button type="submit">
          {editingRestaurant ? "💾 Enregistrer les modifications" : "➕ Ajouter"}
        </button>
        {editingRestaurant && (
          <button type="button" onClick={() => {
            setEditingRestaurant(null);
            setFormData({ nom_restaurant: "", ville: "", type_cuisine: "", prix_moyen: 0, latitude: 0, longitude: 0, created_at: "" });
          }}>
            ❌ Annuler
          </button>
        )}
      </form>

      {/* Tableau */}
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Ville</th>
            <th>Type de cuisine</th>
            <th>Prix moyen</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Creation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((r) => (
            <tr key={r.id_restaurant}>
              <td>{r.nom_restaurant}</td>
              <td>{r.ville}</td>
              <td>{r.type_cuisine}</td>
              <td>{r.prix_moyen}</td>
              <td>{r.latitude}</td>
              <td>{r.longitude}</td>
              <td>
                {new Date(r.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td>
                <button onClick={() => editRestaurant(r)}>✏️ Modifier</button>
                <button onClick={() => deleteRestaurant(r.id_restaurant)}>🗑️ Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

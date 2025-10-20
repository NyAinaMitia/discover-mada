"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix for Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored icons for different activity types
const getActivityIcon = (type: string) => {
  const colorMap: Record<string, string> = {
    'Nature': 'green',
    'Culture': 'orange',
    'Aventure': 'red',
    'Aquatique': 'blue',
    'Nourriture': 'gold',
    'Artistique': 'violet',
    'Sport': 'red'
  };
  
  const color = colorMap[type] || 'blue';
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

interface Activite {
  id_activite: number;
  nom_activite: string;
  ville: string;
  description?: string;
  prix?: number;
  type_activite?: string;
  note?: number;
  latitude?: number;
  longitude?: number;
}

// Component to handle map clicks for location selection
function LocationSelector({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ActivitesPage() {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterVille, setFilterVille] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [isMapReady, setIsMapReady] = useState(false);

  const [formData, setFormData] = useState<Partial<Activite>>({
    nom_activite: "",
    ville: "",
    description: "",
    prix: 0,
    type_activite: "",
    note: 0,
    latitude: -18.8792,
    longitude: 47.5079,
  });

  const activityTypes = [
    "Aventure",
    "Nature", 
    "Culture",
    "Aquatique",
    "Nourriture",
    "Artistique",
    "Sport"
  ];

  const madagascarCities = [
    "Antananarivo",
    "Antsirabe",
    "Fianarantsoa",
    "Toamasina",
    "Mahajanga",
    "Toliara",
    "Antsiranana",
    "Morondava",
    "Nosy Be",
    "Ambositra",
    "Manakara",
    "Sambava",
    "Sainte Marie",
    "Fort Dauphin",
    "Ranomafana",
    "Andasibe",
    "Ifaty",
    "Ankarana",
    "Isalo",
    "Mananjary"
  ].sort();

  const fetchActivites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/activites");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setActivites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivites();
    // Load Leaflet CSS dynamically
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      setIsMapReady(true);
    }
  }, []);

  useEffect(() => {
    if (showForm && !editingId) {
      setFormData(prev => ({
        ...prev,
        ville: filterVille || "",
        type_activite: filterType || "",
        latitude: -18.8792,
        longitude: 47.5079,
      }));
    }
  }, [showForm, filterVille, filterType, editingId]);

  const handleSubmit = async () => {
    try {
      const url = "/api/activites";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...formData, id_activite: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      await fetchActivites();
      resetForm();
      alert(editingId ? "Activité mise à jour !" : "Activité créée !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) return;

    try {
      const response = await fetch(`/api/activites?id_activite=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      await fetchActivites();
      alert("Activité supprimée !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleEdit = (activite: Activite) => {
    setEditingId(activite.id_activite);
    setFormData(activite);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      nom_activite: "",
      ville: filterVille || "",
      description: "",
      prix: 0,
      type_activite: filterType || "",
      note: 0,
      latitude: -18.8792,
      longitude: 47.5079,
    });
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  const uniqueCities = Array.from(new Set([...madagascarCities, ...activites.map(a => a.ville).filter(Boolean)])).sort();
  const uniqueTypes = Array.from(new Set([...activityTypes, ...activites.map(a => a.type_activite).filter(Boolean)])).sort();

  const filteredActivites = activites.filter(activite => {
    const matchVille = !filterVille || activite.ville === filterVille;
    const matchType = !filterType || activite.type_activite === filterType;
    return matchVille && matchType;
  });

  const activitiesWithLocation = filteredActivites.filter(a => a.latitude && a.longitude);

  const activitiesByCity = filteredActivites.reduce((acc, activite) => {
    const city = activite.ville || "Autre";
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(activite);
    return acc;
  }, {} as Record<string, Activite[]>);

  const getTypeImage = (type: string) => {
    const images: Record<string, string> = {
      'Nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
      'Culture': 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=1200&q=80',
      'Aventure': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
      'Aquatique': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
      'Nourriture': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
      'Sport': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
      'Artistique': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80',
    };
    return images[type] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';
  };

  const getTypeColors = (type: string) => {
    const colors: Record<string, { primary: string; secondary: string; gradient: string; light: string }> = {
      'Nature': {
        primary: '#2D5016',
        secondary: '#5A9216',
        gradient: 'from-[#2D5016] via-[#3D6B1F] to-[#5A9216]',
        light: 'rgba(45, 80, 22, 0.1)'
      },
      'Culture': {
        primary: '#8B4513',
        secondary: '#D2691E',
        gradient: 'from-[#8B4513] via-[#A0522D] to-[#D2691E]',
        light: 'rgba(139, 69, 19, 0.1)'
      },
      'Aventure': {
        primary: '#8B0000',
        secondary: '#DC143C',
        gradient: 'from-[#8B0000] via-[#B22222] to-[#DC143C]',
        light: 'rgba(139, 0, 0, 0.1)'
      },
      'Aquatique': {
        primary: '#006994',
        secondary: '#0090C1',
        gradient: 'from-[#006994] via-[#007CAD] to-[#0090C1]',
        light: 'rgba(0, 105, 148, 0.1)'
      },
      'Nourriture': {
        primary: '#C17817',
        secondary: '#F4A460',
        gradient: 'from-[#C17817] via-[#D2861F] to-[#F4A460]',
        light: 'rgba(193, 120, 23, 0.1)'
      },
      'Artistique': {
        primary: '#4B0082',
        secondary: '#8A2BE2',
        gradient: 'from-[#4B0082] via-[#6A0DAD] to-[#8A2BE2]',
        light: 'rgba(75, 0, 130, 0.1)'
      },
      'Sport': {
        primary: '#FF4500',
        secondary: '#FF6347',
        gradient: 'from-[#FF4500] via-[#FF5733] to-[#FF6347]',
        light: 'rgba(255, 69, 0, 0.1)'
      }
    };
    return colors[type] || {
      primary: '#333333',
      secondary: '#666666',
      gradient: 'from-[#333333] to-[#666666]',
      light: 'rgba(51, 51, 51, 0.1)'
    };
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#D2691E]/20 border-t-[#D2691E] mb-6"></div>
        <div className="text-[#333333] text-lg font-light tracking-wider">Chargement...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
      <div className="text-red-700 text-lg font-light tracking-wide">Erreur: {error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#101c22] via-[#2F4F4F] to-[#101c22] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D2691E]/30 via-transparent to-[#D2691E]/30 animate-pulse"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-28 lg:py-36">
          <div className="text-center">
            <div className="inline-block mb-8">
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#D2691E] to-transparent mx-auto"></div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-light tracking-wide mb-6 leading-tight">
              Activités Exclusives
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 font-light leading-relaxed">
              Découvrez Madagascar avec raffinement
            </p>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#D2691E] to-transparent mx-auto mt-8"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        {/* Filters and Controls */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 w-full">
              <div className="group">
                <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                  Ville
                </label>
                <div className="relative">
                  <select
                    value={filterVille}
                    onChange={(e) => setFilterVille(e.target.value)}
                    className="w-full bg-white border-2 border-[#D2691E]/20 rounded-xl px-6 py-4 text-[#333333] focus:outline-none focus:border-[#D2691E] transition-all duration-300 font-light tracking-wide appearance-none cursor-pointer hover:border-[#D2691E]/40 shadow-sm hover:shadow-md"
                  >
                    <option value="">Toutes les villes</option>
                    {uniqueCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#D2691E]">▼</div>
                </div>
              </div>
              
              <div className="group">
                <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                  Type d'activité
                </label>
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-white border-2 border-[#D2691E]/20 rounded-xl px-6 py-4 text-[#333333] focus:outline-none focus:border-[#D2691E] transition-all duration-300 font-light tracking-wide appearance-none cursor-pointer hover:border-[#D2691E]/40 shadow-sm hover:shadow-md"
                  >
                    <option value="">Tous les types</option>
                    {uniqueTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#D2691E]">▼</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
                className="relative bg-white border-2 border-[#D2691E] text-[#D2691E] px-8 py-4 font-light uppercase tracking-widest text-xs rounded-xl hover:bg-[#D2691E] hover:text-white transition-all duration-300"
              >
                {viewMode === "grid" ? "🗺️ Carte" : "📋 Grille"}
              </button>

              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (!showForm && !editingId) {
                    setFormData({
                      ...formData,
                      ville: filterVille || "",
                      type_activite: filterType || "",
                      latitude: -18.8792,
                      longitude: 47.5079,
                    });
                  }
                }}
                className="relative bg-gradient-to-r from-[#D2691E] to-[#B8572A] text-white px-10 py-4 font-light uppercase tracking-widest text-xs rounded-xl hover:shadow-2xl transition-all duration-300 whitespace-nowrap overflow-hidden group"
              >
                <span className="relative z-10">{showForm ? "Fermer" : "Ajouter"}</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-20 bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border-t-4 border-[#D2691E]">
            <div className="flex items-center gap-6 mb-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D2691E]"></div>
              <h2 className="text-3xl font-light text-[#333333] uppercase tracking-widest">
                {editingId ? "Modifier" : "Nouvelle Activité"}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D2691E]"></div>
            </div>

            {(filterVille || filterType) && !editingId && (
              <div className="mb-6 p-4 bg-[#D2691E]/10 rounded-xl border border-[#D2691E]/20">
                <p className="text-sm text-[#333333] font-light">
                  <span className="font-medium">📌 Pré-rempli depuis les filtres:</span>
                  {filterVille && <span className="ml-2">Ville: <strong>{filterVille}</strong></span>}
                  {filterType && <span className="ml-2">Type: <strong>{filterType}</strong></span>}
                </p>
              </div>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                    Nom de l'activité *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom_activite}
                    onChange={(e) =>
                      setFormData({ ...formData, nom_activite: e.target.value })
                    }
                    className="w-full border-b-2 border-[#D2691E]/30 bg-transparent py-4 text-[#333333] placeholder-gray-400 focus:outline-none focus:border-[#D2691E] transition-all duration-300 font-light tracking-wide"
                    placeholder="Ex: Visite du parc national"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                    Ville *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full border-b-2 border-[#D2691E]/30 bg-transparent py-4 text-[#333333] focus:outline-none focus:border-[#D2691E] transition-all duration-300 font-light tracking-wide appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez une ville</option>
                      {madagascarCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#D2691E]">▼</div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                    Type d'activité *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.type_activite}
                      onChange={(e) =>
                        setFormData({ ...formData, type_activite: e.target.value })
                      }
                      className="w-full border-b-2 border-[#D2691E]/30 bg-transparent py-4 text-[#333333] focus:outline-none focus:border-[#D2691E] transition-all duration-300 font-light tracking-wide appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez un type</option>
                      {activityTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#D2691E]">▼</div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                    Prix (Ar)
                  </label>
                  <input
                    type="number"
                    value={formData.prix || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, prix: parseInt(e.target.value) || 0 })
                    }
                    className="w-full border-b-2 border-[#D2691E]/30 bg-transparent py-4 text-[#333333] placeholder-gray-400 focus:outline-none focus:border-[#D2691E] transition-all duration-300 font-light tracking-wide"
                    placeholder="0"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                    Note (0-5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.note || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, note: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border-b-2 border-[#D2691E]/30 bg-transparent py-4 text-[#333333] placeholder-gray-400 focus:outline-none focus:border-[#D2691E] transition-all duration-300 font-light tracking-wide"
                    placeholder="0.0"
                  />
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full border-b-2 border-[#D2691E]/30 bg-transparent py-4 text-[#333333] placeholder-gray-400 focus:outline-none focus:border-[#D2691E] transition-all duration-300 resize-none font-light tracking-wide"
                    placeholder="Décrivez l'activité..."
                  />
                </div>

                {/* Map for location selection */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-light text-[#333333] mb-3 uppercase tracking-widest">
                    Localisation (Cliquez sur la carte)
                  </label>
                  <div className="border-2 border-[#D2691E]/20 rounded-xl overflow-hidden">
                    {isMapReady && (
                      <MapContainer
                        center={[formData.latitude || -18.8792, formData.longitude || 47.5079]}
                        zoom={6}
                        style={{ height: "400px", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <LocationSelector onLocationSelect={handleMapClick} />
                        {formData.latitude && formData.longitude && (
                          <Marker position={[formData.latitude, formData.longitude]}>
                            <Popup>
                              <div className="text-center">
                                <p className="font-semibold">{formData.nom_activite || "Nouvelle activité"}</p>
                                <p className="text-xs text-gray-600">
                                  {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Position: {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-[#D2691E] to-[#B8572A] text-white px-10 py-4 font-light uppercase tracking-widest text-xs rounded-xl hover:shadow-2xl transition-all duration-300"
                >
                  {editingId ? "Mettre à jour" : "Créer"}
                </button>
                <button
                  onClick={resetForm}
                  className="border-2 border-[#D2691E] text-[#D2691E] px-10 py-4 font-light uppercase tracking-widest text-xs rounded-xl hover:bg-[#D2691E] hover:text-white transition-all duration-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map View */}
        {viewMode === "map" && isMapReady && (
          <div className="mb-20">
            <div className="flex items-center gap-6 mb-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D2691E]"></div>
              <h2 className="text-3xl font-light text-[#333333] uppercase tracking-widest">
                Carte des Activités
                <span className="text-lg text-[#D2691E] ml-4 font-light">
                  ({activitiesWithLocation.length})
                </span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D2691E]"></div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-t-4 border-[#D2691E]">
              <MapContainer
                center={[-18.8792, 47.5079]}
                zoom={6}
                style={{ height: "600px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {activitiesWithLocation.map((activite) => (
                  <Marker
                    key={activite.id_activite}
                    position={[activite.latitude!, activite.longitude!]}
                    icon={getActivityIcon(activite.type_activite || '')}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-lg mb-2">{activite.nom_activite}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          📍 {activite.ville}
                        </p>
                        {activite.type_activite && (
                          <p className="text-xs text-gray-500 mb-2">
                            🏷️ {activite.type_activite}
                          </p>
                        )}
                        {activite.description && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {activite.description}
                          </p>
                        )}
                        {activite.prix && activite.prix > 0 && (
                          <p className="text-sm font-semibold text-[#D2691E] mb-2">
                            {activite.prix.toLocaleString()} Ar
                          </p>
                        )}
                        {activite.note && activite.note > 0 && (
                          <p className="text-sm mb-3">
                            ⭐ {activite.note.toFixed(1)}/5
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(activite)}
                            className="flex-1 bg-[#D2691E] text-white text-xs py-2 px-3 rounded hover:bg-[#B8572A] transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(activite.id_activite)}
                            className="flex-1 bg-red-500 text-white text-xs py-2 px-3 rounded hover:bg-red-600 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {activitiesWithLocation.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl shadow-xl mt-8">
                <p className="text-gray-500 font-light">
                  Aucune activité avec localisation trouvée
                </p>
              </div>
            )}
          </div>
        )}

        {/* Grid View - Activities by City */}
        {viewMode === "grid" && Object.entries(activitiesByCity).map(([city, cityActivities]) => (
          <div key={city} className="mb-24">
            <div className="flex items-center gap-6 mb-14">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D2691E]"></div>
              <h2 className="text-4xl font-light text-[#333333] uppercase tracking-widest">
                {city}
                <span className="text-lg text-[#D2691E] ml-4 font-light">
                  ({cityActivities.length})
                </span>
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D2691E]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {cityActivities.map((activite, index) => {
                const colors = getTypeColors(activite.type_activite || '');
                return (
                  <div
                    key={activite.id_activite}
                    className="luxury-card group cursor-pointer bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden transform hover:-translate-y-4 hover:scale-[1.02]"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                      borderTop: `4px solid ${colors.primary}`
                    }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br opacity-20 z-10 group-hover:opacity-30 transition-opacity duration-700"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                      ></div>
                      <img 
                        src={getTypeImage(activite.type_activite || '')}
                        alt={activite.nom_activite}
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-125 group-hover:rotate-2"
                      />
                      <div 
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"
                      ></div>
                      
                      {activite.note && activite.note > 0 && (
                        <div 
                          className="absolute top-6 right-6 text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-md border-2 border-white/30 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                          style={{ 
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                          }}
                        >
                          <span className="text-base">★</span>
                          <span className="text-sm font-light tracking-wider">{activite.note.toFixed(1)}</span>
                        </div>
                      )}

                      {activite.latitude && activite.longitude && (
                        <div className="absolute top-6 left-6 text-white px-3 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-xs">
                          📍
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 border-2 border-white/40 shadow-xl">
                          {activite.type_activite && (
                            <p 
                              className="text-xs uppercase tracking-widest font-medium text-center"
                              style={{ color: colors.primary }}
                            >
                              {activite.type_activite}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 space-y-5 relative" style={{ backgroundColor: colors.light }}>
                      <div 
                        className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-current to-transparent transform -translate-y-1/2 opacity-50"
                        style={{ color: colors.primary }}
                      ></div>
                      
                      <h3 
                        className="text-2xl font-light transition-colors duration-500 tracking-wide leading-tight min-h-[3.5rem]"
                        style={{ color: '#333333' }}
                      >
                        {activite.nom_activite}
                      </h3>

                      {activite.description && (
                        <p className="text-sm text-gray-600 font-light line-clamp-3 tracking-wide leading-relaxed min-h-[4.5rem]">
                          {activite.description}
                        </p>
                      )}

                      <div className="pt-4">
                        {activite.prix !== undefined && activite.prix > 0 && (
                          <div className="flex items-baseline gap-2 mb-6">
                            <p 
                              className="text-3xl font-light tracking-wide"
                              style={{ color: colors.primary }}
                            >
                              {activite.prix.toLocaleString()}
                            </p>
                            <span className="text-sm text-gray-500 font-light tracking-wider">Ar</span>
                          </div>
                        )}

                        <div className="flex gap-3 pt-5 border-t-2" style={{ borderColor: `${colors.primary}20` }}>
                          <button
                            onClick={() => handleEdit(activite)}
                            className="flex-1 text-xs text-white uppercase tracking-widest font-light hover:shadow-lg transition-all duration-300 py-3.5 rounded-xl transform hover:scale-105"
                            style={{ 
                              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(activite.id_activite)}
                            className="flex-1 text-xs text-gray-600 uppercase tracking-widest font-light hover:text-white hover:bg-red-600 transition-all duration-300 py-3.5 rounded-xl border-2 border-gray-300 hover:border-red-600 transform hover:scale-105"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {viewMode === "grid" && filteredActivites.length === 0 && (
          <div className="text-center py-24 bg-white shadow-xl rounded-3xl">
            <div className="text-8xl mb-8 opacity-20">🏝️</div>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#D2691E] to-transparent mx-auto mb-8"></div>
            <h3 className="text-3xl font-light text-[#333333] mb-4 uppercase tracking-widest">
              Aucune activité trouvée
            </h3>
            <p className="text-gray-500 font-light mb-10 tracking-wide">
              {filterVille || filterType 
                ? "Essayez de modifier vos filtres" 
                : "Commencez par créer votre première activité"}
            </p>
            {!filterVille && !filterType && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-[#D2691E] to-[#B8572A] text-white px-10 py-4 font-light uppercase tracking-widest text-xs rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Créer une activité
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .luxury-card {
          position: relative;
          backdrop-filter: blur(10px);
        }
        
        .luxury-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 2rem;
          padding: 2px;
          background: linear-gradient(135deg, rgba(210, 105, 30, 0.4), transparent, rgba(210, 105, 30, 0.4));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.7s ease;
        }
        
        .luxury-card:hover::before {
          opacity: 1;
        }
        
        .luxury-card::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 2rem;
          background: linear-gradient(135deg, rgba(210, 105, 30, 0.15), transparent);
          opacity: 0;
          transition: opacity 0.7s ease;
          pointer-events: none;
          z-index: -1;
          filter: blur(20px);
        }
        
        .luxury-card:hover::after {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
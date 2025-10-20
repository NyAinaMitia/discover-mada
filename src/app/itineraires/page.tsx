"use client";

import { useState, useEffect } from "react";

interface ItineraireJour {
  id_itineraire: number;
  id_voyage: number;
  numero_jour: number;
  date_jour: string;
  ville: string;
  notes?: string;
}

interface Voyage {
  id_voyage: number;
  nom_voyage: string;
  date_debut: string;
  date_fin: string;
}

export default function ItinerairesPage() {
  const [itineraires, setItineraires] = useState<ItineraireJour[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterVoyageId, setFilterVoyageId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  const [availableDays, setAvailableDays] = useState<{day: number, date: string}[]>([]);

  const [formData, setFormData] = useState<Partial<ItineraireJour>>({
    id_voyage: 0,
    numero_jour: 1,
    date_jour: "",
    ville: "",
    notes: "",
  });

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

  // Color palette for voyages
  const voyageColors = [
    { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-500" },
    { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-500" },
    { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-500" },
    { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-500" },
    { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", badge: "bg-pink-500" },
    { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-500" },
    { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-500" },
    { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-500" },
  ];

  const getVoyageColor = (voyageId: number) => {
    const index = voyageId % voyageColors.length;
    return voyageColors[index];
  };

  const fetchVoyages = async () => {
    try {
      console.log("Fetching voyages...");
      const response = await fetch("/api/voyage");
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Erreur lors du chargement des voyages");
      }
      
      const data = await response.json();
      console.log("Voyages loaded:", data);
      setVoyages(data || []);
    } catch (err) {
      console.error("Fetch voyages error:", err);
      setVoyages([]);
    }
  };

  const fetchItineraires = async () => {
    try {
      setLoading(true);
      const url = filterVoyageId
        ? `/api/itineraires?id_voyage=${filterVoyageId}`
        : "/api/itineraires";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setItineraires(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Calculate available days for selected voyage
  const calculateAvailableDays = (voyage: Voyage) => {
    const startDate = new Date(voyage.date_debut);
    const endDate = new Date(voyage.date_fin);
    const days: {day: number, date: string}[] = [];
    
    let currentDate = new Date(startDate);
    let dayNumber = 1;
    
    while (currentDate <= endDate) {
      days.push({
        day: dayNumber,
        date: currentDate.toISOString().split('T')[0]
      });
      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber++;
    }
    
    return days;
  };

  // Handle voyage selection
  const handleVoyageChange = (voyageId: number) => {
    const voyage = voyages.find(v => v.id_voyage === voyageId);
    setSelectedVoyage(voyage || null);
    
    if (voyage) {
      const days = calculateAvailableDays(voyage);
      setAvailableDays(days);
      
      // Set first day by default
      if (days.length > 0) {
        setFormData({
          ...formData,
          id_voyage: voyageId,
          numero_jour: days[0].day,
          date_jour: days[0].date
        });
      }
    } else {
      setAvailableDays([]);
      setFormData({
        ...formData,
        id_voyage: voyageId,
        numero_jour: 1,
        date_jour: ""
      });
    }
  };

  // Handle day number selection
  const handleDayChange = (dayNumber: number) => {
    const selectedDay = availableDays.find(d => d.day === dayNumber);
    if (selectedDay) {
      setFormData({
        ...formData,
        numero_jour: dayNumber,
        date_jour: selectedDay.date
      });
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  useEffect(() => {
    fetchItineraires();
  }, [filterVoyageId]);

  // Initialize form with filter value when opening
  useEffect(() => {
    if (showForm && filterVoyageId && !editingId) {
      const voyage = voyages.find(v => v.id_voyage.toString() === filterVoyageId);
      if (voyage) {
        handleVoyageChange(voyage.id_voyage);
      }
    }
  }, [showForm, filterVoyageId, editingId]);

  const handleSubmit = async () => {
    try {
      // Use filter if form data not set
      const voyageId = formData.id_voyage || (filterVoyageId ? parseInt(filterVoyageId) : 0);
      
      // Validation
      if (!voyageId || voyageId === 0) {
        alert("Veuillez sélectionner un voyage");
        return;
      }
      if (!formData.numero_jour || formData.numero_jour < 1) {
        alert("Veuillez sélectionner un jour");
        return;
      }
      if (!formData.date_jour) {
        alert("La date n'a pas été calculée correctement");
        return;
      }
      if (!formData.ville || formData.ville.trim() === "") {
        alert("Veuillez sélectionner une ville");
        return;
      }

      const url = "/api/itineraires";
      const method = editingId ? "PUT" : "POST";
      
      // Create clean body objects for both insert and update
      const body = editingId
        ? {
            id_itineraire: editingId,
            id_voyage: voyageId,
            numero_jour: formData.numero_jour,
            date_jour: formData.date_jour,
            ville: formData.ville,
            notes: formData.notes,
          }
        : {
            id_voyage: voyageId,
            numero_jour: formData.numero_jour,
            date_jour: formData.date_jour,
            ville: formData.ville,
            notes: formData.notes,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      await fetchItineraires();
      resetForm();
      alert(editingId ? "Itinéraire mis à jour !" : "Itinéraire créé !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet itinéraire ?")) return;

    try {
      const response = await fetch(`/api/itineraires?id_itineraire=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      await fetchItineraires();
      alert("Itinéraire supprimé !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleEdit = (itineraire: ItineraireJour) => {
    setEditingId(itineraire.id_itineraire);
    
    // Find and set the voyage
    const voyage = voyages.find(v => v.id_voyage === itineraire.id_voyage);
    setSelectedVoyage(voyage || null);
    
    if (voyage) {
      const days = calculateAvailableDays(voyage);
      setAvailableDays(days);
    }
    
    // Only set the fields we need, excluding any nested objects like 'voyage'
    setFormData({
      id_voyage: itineraire.id_voyage,
      numero_jour: itineraire.numero_jour,
      date_jour: itineraire.date_jour,
      ville: itineraire.ville,
      notes: itineraire.notes,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setSelectedVoyage(null);
    setAvailableDays([]);
    setFormData({
      id_voyage: 0,
      numero_jour: 1,
      date_jour: "",
      ville: "",
      notes: "",
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8f7f6] flex items-center justify-center">
      <div className="text-[#181611] text-lg">Chargement...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f8f7f6] flex items-center justify-center">
      <div className="text-red-600 text-lg">Erreur: {error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#181611] tracking-tight mb-2">
            Gestion des Itinéraires
          </h1>
          <p className="text-[#8a7e60] text-base">
            Organisez les jours de vos voyages à Madagascar
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#181611] mb-2">
              Filtrer par voyage
            </label>
            <select
              value={filterVoyageId}
              onChange={(e) => setFilterVoyageId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
            >
              <option value="">Tous les voyages</option>
              {voyages.map((voyage) => (
                <option key={voyage.id_voyage} value={voyage.id_voyage}>
                  {voyage.nom_voyage}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-[#f4c652] text-[#181611] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all shadow-md hover:shadow-lg h-12"
            >
              <span className="text-xl">{showForm ? "−" : "+"}</span>
              <span className="hidden sm:inline">{showForm ? "Masquer" : "Nouvel itinéraire"}</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-[#181611] mb-6">
              {editingId ? "Modifier l'itinéraire" : "Nouvel itinéraire"}
            </h2>

            {/* Show pre-selected filter info */}
            {filterVoyageId && !editingId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📌 Ajout au voyage: <strong>
                    {voyages.find(v => v.id_voyage.toString() === filterVoyageId)?.nom_voyage}
                  </strong>
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Voyage *
                  </label>
                  <select
                    required
                    value={formData.id_voyage || (filterVoyageId ? parseInt(filterVoyageId) : 0)}
                    onChange={(e) => handleVoyageChange(parseInt(e.target.value))}
                    disabled={editingId !== null || !!filterVoyageId}
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    <option value="0">Sélectionner un voyage</option>
                    {voyages.map((voyage) => (
                      <option key={voyage.id_voyage} value={voyage.id_voyage}>
                        {voyage.nom_voyage}
                      </option>
                    ))}
                  </select>
                  {editingId && (
                    <p className="text-xs text-[#8a7e60] mt-1">
                      Le voyage ne peut pas être modifié lors de l'édition
                    </p>
                  )}
                  {filterVoyageId && !editingId && (
                    <p className="text-xs text-blue-600 mt-1">
                      Pré-sélectionné depuis le filtre
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Jour du voyage *
                  </label>
                  <select
                    required
                    value={formData.numero_jour}
                    onChange={(e) => handleDayChange(parseInt(e.target.value))}
                    disabled={!selectedVoyage}
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="0">Sélectionner un jour</option>
                    {availableDays.map((day) => (
                      <option key={day.day} value={day.day}>
                        Jour {day.day} - {new Date(day.date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        })}
                      </option>
                    ))}
                  </select>
                  {selectedVoyage && (
                    <p className="text-xs text-[#8a7e60] mt-1">
                      Du {new Date(selectedVoyage.date_debut).toLocaleDateString("fr-FR")} au {new Date(selectedVoyage.date_fin).toLocaleDateString("fr-FR")} ({availableDays.length} jours)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Date du jour
                  </label>
                  <div className="w-full rounded-lg border border-gray-200 bg-gray-50 h-12 px-4 text-[#8a7e60] flex items-center">
                    {formData.date_jour ? 
                      new Date(formData.date_jour).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : 
                      "Sélectionnez un voyage et un jour"
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Ville *
                  </label>
                  <select
                    required
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                  >
                    <option value="">Sélectionnez une ville</option>
                    {madagascarCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#8a7e60] mt-1">
                    Sélectionnez la ville principale de la journée
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[#181611] placeholder:text-[#8a7e60] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent resize-none"
                    placeholder="Ajoutez des notes pour cette journée..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedVoyage || !formData.date_jour || !formData.ville}
                  className="flex-1 sm:flex-none bg-[#f4c652] text-[#181611] px-8 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? "Mettre à jour" : "Créer l'itinéraire"}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 sm:flex-none bg-white border border-gray-200 text-[#181611] px-8 py-3 rounded-lg font-semibold hover:border-[#f4c652] transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Group itineraries by voyage */}
          {Object.entries(
            itineraires.reduce((acc, itineraire) => {
              const voyageId = itineraire.id_voyage;
              if (!acc[voyageId]) {
                acc[voyageId] = [];
              }
              acc[voyageId].push(itineraire);
              return acc;
            }, {} as Record<number, ItineraireJour[]>)
          ).map(([voyageIdStr, itinerairesGroup]) => {
            const voyageId = parseInt(voyageIdStr);
            const voyage = voyages.find(v => v.id_voyage === voyageId);
            const color = getVoyageColor(voyageId);
            
            // Sort itineraries by day number
            const sortedItineraires = [...itinerairesGroup].sort((a, b) => a.numero_jour - b.numero_jour);
            
            return (
              <div key={voyageId} className="space-y-3">
                <div className={`${color.bg} ${color.border} border-l-4 rounded-lg p-4`}>
                  <h2 className={`text-lg font-semibold text-[#181611] flex items-center gap-2`}>
                    <span className={`${color.badge} w-3 h-3 rounded-full`}></span>
                    {voyage?.nom_voyage || `Voyage #${voyageId}`}
                    
                  </h2>
                  {voyage && (
                    <p className="text-xs text-[#8a7e60] mt-1 ml-5">
                      Du {new Date(voyage.date_debut).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })} au {new Date(voyage.date_fin).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3 pl-4">
                  {sortedItineraires.map((itineraire) => (
                    <div
                      key={itineraire.id_itineraire}
                      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all ${color.border} border-l-4 overflow-hidden`}
                    >
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`flex items-center justify-center w-16 h-16 ${color.bg} rounded-xl flex-shrink-0`}>
                              <span className="text-2xl font-bold text-[#181611]">
                                {itineraire.numero_jour}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-[#181611] mb-1">
                                {itineraire.ville}
                              </h3>
                              <p className="text-sm text-[#8a7e60] mb-2">
                                {new Date(itineraire.date_jour).toLocaleDateString("fr-FR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                              {itineraire.notes && (
                                <p className="text-sm text-[#8a7e60] mt-3 line-clamp-2">
                                  {itineraire.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(itineraire)}
                              className="bg-[#f4c652]/10 text-[#181611] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#f4c652]/20 transition-all"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(itineraire.id_itineraire)}
                              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-all"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {itineraires.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-[#181611] mb-2">
              Aucun itinéraire
            </h3>
            <p className="text-[#8a7e60] mb-6">
              Créez votre premier itinéraire pour planifier votre voyage
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#f4c652] text-[#181611] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all"
            >
              Créer un itinéraire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";

interface Activite {
  id_activite: number;
  nom_activite: string;
  ville: string;
}

interface ItineraireJour {
  id_itineraire: number;
  numero_jour: number;
  date_jour: string;
  ville: string;
  id_voyage: number;
  voyage?: {
    id_voyage: number;
    nom_voyage: string;
  };
}

interface ActivitePlanifiee {
  id_activite_planifiee: number;
  id_itineraire: number;
  id_activite: number;
  heure_debut?: string;
  statut: "planifie" | "effectue" | "annule";
}

interface ActivitePlanifieeWithDetails extends ActivitePlanifiee {
  activite?: Activite;
  itineraire_jour?: ItineraireJour;
}

interface Voyage {
  id_voyage: number;
  nom_voyage: string;
}

export default function ActivitesPlanifieesPage() {
  const [activitesPlanifiees, setActivitesPlanifiees] = useState<ActivitePlanifieeWithDetails[]>([]);
  const [activites, setActivites] = useState<Activite[]>([]);
  const [itineraires, setItineraires] = useState<ItineraireJour[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterVoyageId, setFilterVoyageId] = useState<string>("");
  const [filterItineraireId, setFilterItineraireId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [selectedVoyageForForm, setSelectedVoyageForForm] = useState<string>("");

  const [formData, setFormData] = useState<Partial<ActivitePlanifiee>>({
    id_itineraire: 0,
    id_activite: 0,
    heure_debut: "",
    statut: "planifie",
  });

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
      const response = await fetch("/api/voyage");
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setVoyages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivites = async () => {
    try {
      const response = await fetch("/api/activites");
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setActivites(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItineraires = async () => {
    try {
      const response = await fetch("/api/itineraires");
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setItineraires(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivitesPlanifiees = async () => {
    try {
      setLoading(true);
      const url = filterItineraireId
        ? `/api/activites-planifiees?id_itineraire=${filterItineraireId}`
        : "/api/activites-planifiees";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setActivitesPlanifiees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
    fetchActivites();
    fetchItineraires();
  }, []);

  useEffect(() => {
    fetchActivitesPlanifiees();
  }, [filterItineraireId]);

  const handleSubmit = async () => {
    try {
      // Use filter selections if form fields are not set
      const itineraireId = formData.id_itineraire || (filterItineraireId ? parseInt(filterItineraireId) : 0);
      
      if (!itineraireId || !formData.id_activite) {
        alert("Veuillez sélectionner un itinéraire et une activité");
        return;
      }

      const url = "/api/activites-planifiees";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { 
            id_activite_planifiee: editingId,
            id_itineraire: itineraireId,
            id_activite: formData.id_activite,
            heure_debut: formData.heure_debut,
            statut: formData.statut
          }
        : {
            id_itineraire: itineraireId,
            id_activite: formData.id_activite,
            heure_debut: formData.heure_debut,
            statut: formData.statut
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      await fetchActivitesPlanifiees();
      resetForm();
      alert(editingId ? "Activité planifiée mise à jour !" : "Activité planifiée créée !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité planifiée ?"))
      return;

    try {
      const response = await fetch(
        `/api/activites-planifiees?id_activite_planifiee=${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      await fetchActivitesPlanifiees();
      alert("Activité planifiée supprimée !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleEdit = (activitePlanifiee: ActivitePlanifieeWithDetails) => {
    setEditingId(activitePlanifiee.id_activite_planifiee);
    
    // Find voyage for this itineraire
    const itineraire = itineraires.find(i => i.id_itineraire === activitePlanifiee.id_itineraire);
    if (itineraire) {
      setSelectedVoyageForForm(itineraire.id_voyage.toString());
    }
    
    setFormData({
      id_itineraire: activitePlanifiee.id_itineraire,
      id_activite: activitePlanifiee.id_activite,
      heure_debut: activitePlanifiee.heure_debut,
      statut: activitePlanifiee.statut,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setSelectedVoyageForForm("");
    setFormData({
      id_itineraire: 0,
      id_activite: 0,
      heure_debut: "",
      statut: "planifie",
    });
  };

  const handleStatusChange = async (
    id: number,
    newStatus: "planifie" | "effectue" | "annule"
  ) => {
    try {
      const response = await fetch("/api/activites-planifiees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_activite_planifiee: id,
          statut: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Erreur");

      await fetchActivitesPlanifiees();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "planifie":
        return "bg-blue-500";
      case "effectue":
        return "bg-green-500";
      case "annule":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get filtered itineraires based on selected voyage (for form or filter)
  const getFilteredItinerairesForForm = () => {
    const voyageId = selectedVoyageForForm || filterVoyageId;
    if (!voyageId) return [];
    return itineraires.filter(i => i.id_voyage.toString() === voyageId);
  };

  // Get filtered itineraires for display filter
  const getFilteredItinerairesForDisplay = () => {
    if (!filterVoyageId) return itineraires;
    return itineraires.filter(i => i.id_voyage.toString() === filterVoyageId);
  };

  // Group activities by voyage
  const groupedActivities = activitesPlanifiees.reduce((acc, ap) => {
    const voyageId = ap.itineraire_jour?.id_voyage || 0;
    if (!acc[voyageId]) {
      acc[voyageId] = [];
    }
    acc[voyageId].push(ap);
    return acc;
  }, {} as Record<number, ActivitePlanifieeWithDetails[]>);

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
            Activités Planifiées
          </h1>
          <p className="text-[#8a7e60] text-base">
            Planifiez et suivez vos activités pour chaque jour de voyage
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#181611] mb-2">
                Filtrer par voyage
              </label>
              <select
                value={filterVoyageId}
                onChange={(e) => {
                  setFilterVoyageId(e.target.value);
                  setFilterItineraireId(""); // Reset itineraire filter
                }}
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
            
            <div>
              <label className="block text-sm font-medium text-[#181611] mb-2">
                Filtrer par jour
              </label>
              <select
                value={filterItineraireId}
                onChange={(e) => setFilterItineraireId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
              >
                <option value="">Tous les jours</option>
                {getFilteredItinerairesForDisplay().map((itineraire) => (
                  <option key={itineraire.id_itineraire} value={itineraire.id_itineraire}>
                    Jour {itineraire.numero_jour} - {itineraire.ville}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-[#f4c652] text-[#181611] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-xl">{showForm ? "−" : "+"}</span>
              <span>{showForm ? "Masquer" : "Planifier une activité"}</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-[#181611] mb-6">
              {editingId ? "Modifier l'activité planifiée" : "Nouvelle activité planifiée"}
            </h2>

            {/* Show pre-selected filter info */}
            {(filterVoyageId || filterItineraireId) && !editingId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {filterItineraireId ? (
                    <>
                      📌 Ajout automatique au jour sélectionné: <strong>
                        {itineraires.find(i => i.id_itineraire.toString() === filterItineraireId)?.ville} 
                        (Jour {itineraires.find(i => i.id_itineraire.toString() === filterItineraireId)?.numero_jour})
                      </strong>
                    </>
                  ) : filterVoyageId ? (
                    <>
                      📌 Ajout au voyage: <strong>
                        {voyages.find(v => v.id_voyage.toString() === filterVoyageId)?.nom_voyage}
                      </strong> - Sélectionnez un jour ci-dessous
                    </>
                  ) : null}
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Only show voyage/day selectors if not auto-filled or if editing */}
                {(editingId || !filterItineraireId) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#181611] mb-2">
                        Voyage *
                      </label>
                      <select
                        required
                        value={selectedVoyageForForm || filterVoyageId}
                        onChange={(e) => {
                          setSelectedVoyageForForm(e.target.value);
                          setFormData({ ...formData, id_itineraire: 0 }); // Reset itineraire
                        }}
                        disabled={editingId !== null || !!filterVoyageId}
                        className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                      >
                        <option value="">Sélectionner un voyage</option>
                        {voyages.map((voyage) => (
                          <option key={voyage.id_voyage} value={voyage.id_voyage}>
                            {voyage.nom_voyage}
                          </option>
                        ))}
                      </select>
                      {(filterVoyageId && !editingId) && (
                        <p className="text-xs text-blue-600 mt-1">
                          Pré-sélectionné depuis le filtre
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#181611] mb-2">
                        Jour *
                      </label>
                      <select
                        required
                        value={formData.id_itineraire || (filterItineraireId ? parseInt(filterItineraireId) : 0)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            id_itineraire: parseInt(e.target.value),
                          })
                        }
                        disabled={(!selectedVoyageForForm && !filterVoyageId) || !!filterItineraireId}
                        className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                      >
                        <option value="0">Sélectionner un jour</option>
                        {getFilteredItinerairesForForm().map((itineraire) => (
                          <option
                            key={itineraire.id_itineraire}
                            value={itineraire.id_itineraire}
                          >
                            Jour {itineraire.numero_jour} - {itineraire.ville} (
                            {new Date(itineraire.date_jour).toLocaleDateString("fr-FR")})
                          </option>
                        ))}
                      </select>
                      {(filterItineraireId && !editingId) && (
                        <p className="text-xs text-blue-600 mt-1">
                          Pré-sélectionné depuis le filtre
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className={editingId || !filterItineraireId ? "" : "md:col-span-2"}>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Activité *
                  </label>
                  <select
                    required
                    value={formData.id_activite}
                    onChange={(e) =>
                      setFormData({ ...formData, id_activite: parseInt(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                  >
                    <option value="0">Sélectionner une activité</option>
                    {activites.map((activite) => (
                      <option key={activite.id_activite} value={activite.id_activite}>
                        {activite.nom_activite} - {activite.ville}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.heure_debut}
                    onChange={(e) =>
                      setFormData({ ...formData, heure_debut: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Statut *
                  </label>
                  <select
                    required
                    value={formData.statut}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statut: e.target.value as "planifie" | "effectue" | "annule",
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                  >
                    <option value="planifie">Planifié</option>
                    <option value="effectue">Effectué</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 sm:flex-none bg-[#f4c652] text-[#181611] px-8 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all"
                >
                  {editingId ? "Mettre à jour" : "Planifier l'activité"}
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
          {Object.entries(groupedActivities).map(([voyageIdStr, activities]) => {
            const voyageId = parseInt(voyageIdStr);
            const voyage = voyages.find(v => v.id_voyage === voyageId);
            const color = getVoyageColor(voyageId);
            
            return (
              <div key={voyageId} className="space-y-3">
                <div className={`${color.bg} ${color.border} border-l-4 rounded-lg p-4`}>
                  <h2 className={`text-lg font-semibold text-[#181611] flex items-center gap-2`}>
                    <span className={`${color.badge} w-3 h-3 rounded-full`}></span>
                    {voyage?.nom_voyage || `Voyage #${voyageId}`}
                    <span className="text-sm font-normal text-[#8a7e60] ml-2">
                      ({activities.length} activité{activities.length > 1 ? 's' : ''})
                    </span>
                  </h2>
                </div>
                
                <div className="space-y-3 pl-4">
                  {activities.map((ap) => (
                    <div
                      key={ap.id_activite_planifiee}
                      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all ${color.border} border-l-4 overflow-hidden`}
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`flex items-center justify-center w-12 h-12 ${color.bg} rounded-lg flex-shrink-0`}>
                              <span className="text-xl">📍</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-[#181611]">
                                  {ap.activite?.nom_activite || `Activité #${ap.id_activite}`}
                                </h3>
                                <select
                                  value={ap.statut}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      ap.id_activite_planifiee,
                                      e.target.value as "planifie" | "effectue" | "annule"
                                    )
                                  }
                                  className={`${getStatusColor(ap.statut)} text-white text-xs font-semibold px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f4c652] cursor-pointer`}
                                >
                                  <option value="planifie">Planifié</option>
                                  <option value="effectue">Effectué</option>
                                  <option value="annule">Annulé</option>
                                </select>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm text-[#8a7e60]">
                                {ap.itineraire_jour && (
                                  <span className="flex items-center gap-1">
                                    <span className="font-medium">Jour {ap.itineraire_jour.numero_jour}</span>
                                    <span>•</span>
                                    <span>
                                      {new Date(ap.itineraire_jour.date_jour).toLocaleDateString("fr-FR", {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </span>
                                  </span>
                                )}
                                
                                {ap.activite?.ville && (
                                  <>
                                    <span>•</span>
                                    <span>{ap.activite.ville}</span>
                                  </>
                                )}
                                
                                {ap.heure_debut && (
                                  <>
                                    <span>•</span>
                                    <span className="font-medium">🕐 {ap.heure_debut}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 lg:ml-4">
                            <button
                              onClick={() => handleEdit(ap)}
                              className="bg-[#f4c652]/10 text-[#181611] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#f4c652]/20 transition-all"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(ap.id_activite_planifiee)}
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

        {activitesPlanifiees.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-[#181611] mb-2">
              Aucune activité planifiée
            </h3>
            <p className="text-[#8a7e60] mb-6">
              Commencez à planifier vos activités pour votre voyage
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#f4c652] text-[#181611] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all"
            >
              Planifier une activité
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
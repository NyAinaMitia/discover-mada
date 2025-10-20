"use client";

import { useState, useEffect } from "react";

interface Voyage {
  id_voyage: number;
  id_user?: number;
  nom_voyage: string;
  date_debut: string;
  date_fin: string;
  budget?: number;
  statut: "planifie" | "en_cours" | "termine";
  id_pack?: number;
  created_at?: string;
}

export default function VoyagesPage() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Partial<Voyage>>({
    nom_voyage: "",
    date_debut: "",
    date_fin: "",
    budget: 0,
    statut: "planifie",
  });

  const fetchVoyages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/voyage");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du chargement");
      }
      const data = await response.json();
      setVoyages(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  const handleSubmit = async () => {
    try {
      // Validate dates
      if (formData.date_debut && formData.date_fin) {
        if (new Date(formData.date_debut) > new Date(formData.date_fin)) {
          alert("La date de début doit être antérieure à la date de fin");
          return;
        }
      }

      const url = "/api/voyage";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { ...formData, id_voyage: editingId }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      await fetchVoyages();
      resetForm();
      alert(editingId ? "Voyage mis à jour !" : "Voyage créé !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce voyage ?")) return;

    try {
      const response = await fetch(`/api/voyage?id_voyage=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }

      await fetchVoyages();
      alert("Voyage supprimé !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleEdit = (voyage: Voyage) => {
    setEditingId(voyage.id_voyage);
    setFormData({
      nom_voyage: voyage.nom_voyage,
      date_debut: voyage.date_debut,
      date_fin: voyage.date_fin,
      budget: voyage.budget,
      statut: voyage.statut,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      nom_voyage: "",
      date_debut: "",
      date_fin: "",
      budget: 0,
      statut: "planifie",
    });
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "planifie":
        return "bg-blue-100 text-blue-700";
      case "en_cours":
        return "bg-green-100 text-green-700";
      case "termine":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "planifie":
        return "Planifié";
      case "en_cours":
        return "En cours";
      case "termine":
        return "Terminé";
      default:
        return statut;
    }
  };

  const calculateDuration = (dateDebut: string, dateFin: string) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8f7f6] flex items-center justify-center">
      <div className="text-[#181611] text-lg">Chargement...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f8f7f6] flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
        <h3 className="text-red-800 font-semibold mb-2">Erreur</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchVoyages}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#181611] tracking-tight mb-2">
            Gestion des Voyages
          </h1>
          <p className="text-[#8a7e60] text-base">
            Planifiez et organisez vos voyages à Madagascar
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#f4c652] text-[#181611] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all shadow-md hover:shadow-lg"
          >
            <span className="text-xl">{showForm ? "−" : "+"}</span>
            <span>{showForm ? "Masquer le formulaire" : "Nouveau Voyage"}</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-[#181611] mb-6">
              {editingId ? "Modifier le voyage" : "Nouveau voyage"}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Nom du voyage *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom_voyage}
                    onChange={(e) =>
                      setFormData({ ...formData, nom_voyage: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] placeholder:text-[#8a7e60] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                    placeholder="Ex: Découverte du Sud de Madagascar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_debut}
                    onChange={(e) =>
                      setFormData({ ...formData, date_debut: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_fin}
                    onChange={(e) =>
                      setFormData({ ...formData, date_fin: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#181611] mb-2">
                    Budget (Ar)
                  </label>
                  <input
                    type="number"
                    value={formData.budget || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] placeholder:text-[#8a7e60] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                    placeholder="0"
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
                        statut: e.target.value as "planifie" | "en_cours" | "termine",
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white h-12 px-4 text-[#181611] focus:outline-none focus:ring-2 focus:ring-[#f4c652] focus:border-transparent"
                  >
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 sm:flex-none bg-[#f4c652] text-[#181611] px-8 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all"
                >
                  {editingId ? "Mettre à jour" : "Créer le voyage"}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="flex-1 sm:flex-none bg-white border border-gray-200 text-[#181611] px-8 py-3 rounded-lg font-semibold hover:border-[#f4c652] transition-all"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voyages.map((voyage) => (
            <div
              key={voyage.id_voyage}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden group"
            >
              <div className="bg-gradient-to-r from-[#f4c652] to-[#e0b045] p-4">
                <h3 className="text-lg font-semibold text-[#181611] mb-1">
                  {voyage.nom_voyage}
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(voyage.statut)}`}>
                  {getStatusLabel(voyage.statut)}
                </span>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[#8a7e60]">
                    <span className="text-lg">📅</span>
                    <div>
                      <div className="font-medium text-[#181611]">
                        {new Date(voyage.date_debut).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-xs">
                        au {new Date(voyage.date_fin).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">⏱️</span>
                    <span className="font-medium text-[#181611]">
                      {calculateDuration(voyage.date_debut, voyage.date_fin)} jours
                    </span>
                  </div>

                  {voyage.budget && voyage.budget > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">💰</span>
                      <span className="font-medium text-[#181611]">
                        {voyage.budget.toLocaleString()} Ar
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(voyage)}
                    className="flex-1 bg-[#f4c652]/10 text-[#181611] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#f4c652]/20 transition-all"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(voyage.id_voyage)}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-all"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {voyages.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-[#181611] mb-2">
              Aucun voyage
            </h3>
            <p className="text-[#8a7e60] mb-6">
              Commencez à planifier votre première aventure à Madagascar
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#f4c652] text-[#181611] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4c652]/90 transition-all"
            >
              Créer un voyage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
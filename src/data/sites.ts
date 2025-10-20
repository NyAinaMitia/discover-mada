import { Site } from "@/types";

// ============================================
// TYPES FOR ALL DATABASE TABLES
// ============================================

export interface User {
  id_user: number;
  nom: string;
  email: string;
  mot_de_passe: string;
  created_at?: string;
}

export interface Pack {
  id_pack: number;
  type?: string;
  description?: string;
  prix?: number;
}

export interface Voyage {
  id_voyage: number;
  id_user?: number;
  id_destination?: number;
  nom_voyage: string;
  date_debut: string;
  date_fin: string;
  budget?: number;
  statut?: 'planifie' | 'en_cours' | 'termine';
  id_pack?: number;
  created_at?: string;
}

export interface Activite {
  id_activite: number;
  nom_activite: string;
  ville: string;
  description?: string;
  prix?: number;
  type_activite?: string;
  note?: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface Restaurant {
  id_restaurant: number;
  nom_restaurant: string;
  ville: string;
  type_cuisine?: string;
  prix_moyen?: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface Hotel {
  id_hotel: number;
  nom_hotel: string;
  ville: string;
  prix_nuit?: number;
  etoiles?: number;
  type?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface ItineraireJour {
  id_itineraire: number;
  id_voyage: number;
  numero_jour: number;
  date_jour: string;
  ville: string;
  notes?: string;
}

export interface ActivitePlanifiee {
  id_activite_planifiee: number;
  id_itineraire: number;
  id_activite: number;
  heure_debut?: string;
  statut?: 'planifie' | 'effectue' | 'annule';
}

export interface RestaurantPlanifie {
  id_restaurant_planifie: number;
  id_itineraire: number;
  id_restaurant: number;
  heure_reservation?: string;
  statut?: 'planifie' | 'effectue' | 'annule';
}

export interface HotelPlanifie {
  id_hotel_planifie: number;
  id_itineraire: number;
  id_hotel: number;
  statut?: 'planifie' | 'effectue' | 'annule';
}

export interface TransportPlanifie {
  id_transport: number;
  id_voyage: number;
  type_transport: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  date_arrivee: string;
  prix?: number;
  statut?: 'planifie' | 'reserve' | 'effectue';
}

// ============================================
// TOURIST SITES DATA
// ============================================

export const sitesTouristiques: Site[] = [
  {
    id: 1,
    nom: "Avenue des Baobabs",
    latitude: -20.248,
    longitude: 44.615,
    description: "Un site emblématique de Madagascar avec ses baobabs majestueux.",
  },
  {
    id: 2,
    nom: "Parc National de l'Isalo",
    latitude: -22.633,
    longitude: 45.35,
    description: "Canyons spectaculaires, piscines naturelles et paysages lunaires.",
  },
  {
    id: 3,
    nom: "Réserve Naturelle Intégrale du Tsingy de Bemaraha",
    latitude: -18.866,
    longitude: 44.766,
    description: "Un ensemble de formations calcaires impressionnantes et uniques au monde.",
  },
  {
    id: 4,
    nom: "Île Sainte-Marie (Nosy Boraha)",
    latitude: -17.166,
    longitude: 49.916,
    description: "Une île paradisiaque, ancien repaire de pirates et lieu d'observation des baleines.",
  },
];
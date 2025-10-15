// donnees.ts

export interface SiteTouristique {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
  description: string;
}

export const sitesTouristiques: SiteTouristique[] = [
  {
    id: 1,
    nom: "Avenue des Baobabs",
    latitude: -20.248,
    longitude: 44.615,
    description:
      "Un site emblématique de Madagascar avec ses baobabs majestueux.",
  },
  {
    id: 2,
    nom: "Parc National de l'Isalo",
    latitude: -22.633,
    longitude: 45.35,
    description:
      "Canyons spectaculaires, piscines naturelles et paysages lunaires.",
  },
  {
    id: 3,
    nom: "Réserve Naturelle Intégrale du Tsingy de Bemaraha",
    latitude: -18.866,
    longitude: 44.766,
    description:
      "Un ensemble de formations calcaires impressionnantes et uniques au monde.",
  },
  {
    id: 4,
    nom: "Île Sainte-Marie (Nosy Boraha)",
    latitude: -17.166,
    longitude: 49.916,
    description:
      "Une île paradisiaque, ancien repaire de pirates et lieu d'observation des baleines.",
  },
];

# Découvrez les Merveilles de Madagascar

Un guide de voyage interactif pour explorer les sites touristiques incontournables de Madagascar, construit avec des technologies modernes.

## Fonctionnalités

- 🗺️ Affiche une carte interactive de Madagascar.
- 📍 Visualise les sites touristiques pré-enregistrés.
- ➕ Ajoute un site à son voyage.
- 🔄 Sauvegarde les sélections dans une base de données.
- 🎨 Les sites sélectionnés changent de couleur sur la carte.

- sy izay rehetra ataotsika ao anatiny ...

## Technologies Utilisées

- [Next.js 15](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Leaflet](https://leafletjs.com/) - Bibliothèque de cartes
- [Supabase](https://supabase.com/) - Base de données et Backend-as-a-Service

## Prérequis

Avant de commencer, assurez-vous d'avoir installé [Node.js](https://nodejs.org/) (version 18 ou supérieure) sur votre machine.

## Installation

Suivez ces étapes pour installer et lancer le projet localement.

1.  **Cloner le dépôt**
    ```bash
    git clone https://github.com/NyAinaMitia/discover-mada.git
    cd discover-mada
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement**
    - Créez un fichier nommé `.env.local` à la racine du projet.
    - Ajoutez vos propres clés Supabase (voir section "Configuration Supabase").

4.  **Lancer le serveur de développement**
    ```bash
    npm run dev
    ```

5.  Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Configuration Supabase

Ce projet utilise Supabase comme base de données. Vous devez créer votre propre projet Supabase et configurer les variables d'environnement.

1.  Créez un nouveau projet sur [supabase.com](https://supabase.com).
2.  Dans votre projet, allez dans `Settings > API` pour récupérer votre URL et votre clé `anon`.
3.  Créez le fichier `.env.local` et ajoutez les lignes suivantes en remplaçant les valeurs :
    ```env
    NEXT_PUBLIC_SUPABASE_URL=votre_url_de_projet
    NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
    ```
4.  Dans le `Table Editor` de Supabase, créez une table nommée `voyages_selectionnes` avec les colonnes `id` (int8, primary key), `site_id` (int8) et `created_at` (timestamptz, default: now()).
5.  Allez dans `Authentication > Policies`, créez une nouvelle politique pour la table `voyages_selectionnes` qui autorise l'opération `INSERT` pour le rôle `anon` avec la condition `true`. na afaka atao hoe all amizay manana autorisation daholo ny opérations rehetra ataotsika ao anatiny ...

## Structure du Projet (pour l'instant)
src/
├── app/ # Pages et layouts Next.js
├── components/ # Composants React
│ ├── map/ # Composants liés à la carte
│ └── ui/ # Composants d'interface génériques
├── lib/ # Utilitaires (client Supabase, etc.)
├── types/ # Définitions de types TypeScript
└── data/ # Données statiques

## Comment Contribuer

1.  Fork le projet.
2.  Créez une branche pour votre fonctionnalité (`git checkout -b feature/NouvelleFonctionnalite`).
3.  Commitez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`).
4.  Pushez vers la branche (`git push origin feature/NouvelleFonctionnalite`).
5.  Ouvrez une Pull Request.
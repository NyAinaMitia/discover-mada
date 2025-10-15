import { createClient, SupabaseClient } from "@supabase/supabase-js";

// On récupère les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as
  | string
  | undefined;

// Vérification de sécurité : si une variable est manquante, on lève une erreur
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Les variables d'environnement Supabase ne sont pas définies."
  );
}

// On crée le client Supabase avec un typage explicite
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

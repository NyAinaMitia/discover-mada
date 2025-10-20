import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Fetch activités planifiées (with joins)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id_itineraire = searchParams.get("id_itineraire");

  let query = supabase
    .from("activite_planifiee")
    .select(`
      *,
      activite (*),
      itineraire_jour (*)
    `)
    .order("heure_debut", { ascending: true });

  if (id_itineraire) {
    query = query.eq("id_itineraire", id_itineraire);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Create new activité planifiée
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("activite_planifiee")
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}

// PUT - Update activité planifiée
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id_activite_planifiee, ...updates } = body;

  if (!id_activite_planifiee) {
    return NextResponse.json(
      { error: "id_activite_planifiee is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("activite_planifiee")
    .update(updates)
    .eq("id_activite_planifiee", id_activite_planifiee)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

// DELETE - Delete activité planifiée
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id_activite_planifiee = searchParams.get("id_activite_planifiee");

  if (!id_activite_planifiee) {
    return NextResponse.json(
      { error: "id_activite_planifiee is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("activite_planifiee")
    .delete()
    .eq("id_activite_planifiee", id_activite_planifiee);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Activité planifiée supprimée avec succès",
  });
}
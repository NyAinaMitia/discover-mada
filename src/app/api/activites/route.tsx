import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Fetch all activités
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get("ville");

  let query = supabase.from("activite").select("*");

  if (ville) {
    query = query.eq("ville", ville);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Create new activité
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("activite")
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}

// PUT - Update activité
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id_activite, ...updates } = body;

  if (!id_activite) {
    return NextResponse.json(
      { error: "id_activite is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("activite")
    .update(updates)
    .eq("id_activite", id_activite)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

// DELETE - Delete activité
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id_activite = searchParams.get("id_activite");

  if (!id_activite) {
    return NextResponse.json(
      { error: "id_activite is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("activite")
    .delete()
    .eq("id_activite", id_activite);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Activité supprimée avec succès" });
}
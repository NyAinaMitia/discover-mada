// File: src/app/api/itineraires/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Fetch itineraires with voyage names (optionally by voyage)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_voyage = searchParams.get("id_voyage");

    console.log("Fetching itineraires...", id_voyage ? `for voyage: ${id_voyage}` : "all");

    let query = supabase
      .from("itineraire_jour")
      .select(`
        *,
        voyage:id_voyage (
          id_voyage,
          nom_voyage,
          date_debut,
          date_fin
        )
      `)
      .order("numero_jour", { ascending: true });

    if (id_voyage) {
      query = query.eq("id_voyage", id_voyage);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("Itineraires fetched:", data?.length || 0);
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST - Create new itineraire (DUPLICATE CHECK REMOVED)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating itineraire:", body);

    // Validate required fields
    if (!body.id_voyage || !body.numero_jour || !body.date_jour || !body.ville) {
      return NextResponse.json(
        { error: "id_voyage, numero_jour, date_jour, and ville are required" },
        { status: 400 }
      );
    }

    // Check if voyage exists
    const { data: voyageExists, error: voyageError } = await supabase
      .from("voyage")
      .select("id_voyage")
      .eq("id_voyage", body.id_voyage)
      .single();

    if (voyageError || !voyageExists) {
      return NextResponse.json(
        { error: "Voyage not found. Please create a voyage first." },
        { status: 404 }
      );
    }

    // REMOVED: Duplicate day number check to allow multiple itineraries per day

    const { data, error } = await supabase
      .from("itineraire_jour")
      .insert([{
        id_voyage: body.id_voyage,
        numero_jour: body.numero_jour,
        date_jour: body.date_jour,
        ville: body.ville,
        notes: body.notes || null,
      }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("Itineraire created:", data[0]);
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Invalid request body", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 }
    );
  }
}

// PUT - Update itineraire (DUPLICATE CHECK REMOVED)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_itineraire, ...updates } = body;

    if (!id_itineraire) {
      return NextResponse.json(
        { error: "id_itineraire is required" },
        { status: 400 }
      );
    }

    console.log("Updating itineraire:", id_itineraire, updates);

    // REMOVED: Duplicate numero_jour check to allow multiple itineraries per day

    const { data, error } = await supabase
      .from("itineraire_jour")
      .update(updates)
      .eq("id_itineraire", id_itineraire)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Itineraire not found" },
        { status: 404 }
      );
    }

    console.log("Itineraire updated:", data[0]);
    return NextResponse.json(data[0]);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Invalid request body", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 }
    );
  }
}

// DELETE - Delete itineraire
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_itineraire = searchParams.get("id_itineraire");

    if (!id_itineraire) {
      return NextResponse.json(
        { error: "id_itineraire is required" },
        { status: 400 }
      );
    }

    console.log("Deleting itineraire:", id_itineraire);

    const { error } = await supabase
      .from("itineraire_jour")
      .delete()
      .eq("id_itineraire", id_itineraire);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("Itineraire deleted successfully");
    return NextResponse.json({ message: "Itinéraire supprimé avec succès" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
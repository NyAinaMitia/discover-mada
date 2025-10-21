// File: src/app/api/voyages/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Fetch all voyages or filter by id_user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_user = searchParams.get("id_user");

    console.log("Fetching voyages from Supabase...");

    let query = supabase
      .from("voyage")
      .select("*")
      .order("created_at", { ascending: false });

    // Optional: filter by user
    if (id_user) {
      query = query.eq("id_user", id_user);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("Voyages fetched:", data?.length || 0);
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST - Create new voyage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating voyage:", body);

    // Validate required fields
    if (!body.nom_voyage || !body.date_debut || !body.date_fin) {
      return NextResponse.json(
        { error: "nom_voyage, date_debut, and date_fin are required" },
        { status: 400 }
      );
    }

    // Validate date order
    if (new Date(body.date_debut) > new Date(body.date_fin)) {
      return NextResponse.json(
        { error: "date_debut must be before date_fin" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("voyage")
      .insert([{
        nom_voyage: body.nom_voyage,
        date_debut: body.date_debut,
        date_fin: body.date_fin,
        budget: body.budget || null,
        statut: body.statut || "planifie",
        id_user: body.id_user || null,
        id_destination: body.id_destination || null,
        id_pack: body.id_pack || null,
      }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("Voyage created:", data[0]);
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Invalid request body", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 }
    );
  }
}

// PUT - Update voyage
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_voyage, ...updates } = body;

    if (!id_voyage) {
      return NextResponse.json(
        { error: "id_voyage is required" },
        { status: 400 }
      );
    }

    console.log("Updating voyage:", id_voyage, updates);

    // Validate date order if both dates are provided
    if (updates.date_debut && updates.date_fin) {
      if (new Date(updates.date_debut) > new Date(updates.date_fin)) {
        return NextResponse.json(
          { error: "date_debut must be before date_fin" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("voyage")
      .update(updates)
      .eq("id_voyage", id_voyage)
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
        { error: "Voyage not found" },
        { status: 404 }
      );
    }

    console.log("Voyage updated:", data[0]);
    return NextResponse.json(data[0]);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Invalid request body", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 }
    );
  }
}

// DELETE - Delete voyage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_voyage = searchParams.get("id_voyage");

    if (!id_voyage) {
      return NextResponse.json(
        { error: "id_voyage is required" },
        { status: 400 }
      );
    }

    console.log("Deleting voyage:", id_voyage);

    const { error } = await supabase
      .from("voyage")
      .delete()
      .eq("id_voyage", id_voyage);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("Voyage deleted successfully");
    return NextResponse.json({ message: "Voyage supprimé avec succès" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
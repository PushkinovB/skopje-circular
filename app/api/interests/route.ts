import { NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase";
import { MATERIALS } from "@/lib/locations";

const channels = new Set(["call", "sms", "viber", "whatsapp"]);
const genericError = { error: "We could not accept this signup. Check the fields and try again." };

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json(genericError, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json(genericError, { status: 400 });
  const input = body as Record<string, unknown>;
  if (typeof input.website === "string" && input.website.trim()) return NextResponse.json({ ok: true }, { status: 202 });
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const contactChannel = typeof input.contactChannel === "string" ? input.contactChannel : "";
  const neighborhood = typeof input.neighborhood === "string" ? input.neighborhood.trim() : null;
  const materials = Array.isArray(input.materials) ? [...new Set(input.materials.filter((item): item is string => typeof item === "string"))] : [];
  const validPhone = /^[+()\d\s.-]{7,30}$/.test(phone);
  if (fullName.length < 2 || fullName.length > 100 || !validPhone || !channels.has(contactChannel) || input.consent !== true || materials.length === 0 || materials.some((item) => !(MATERIALS as readonly string[]).includes(item)) || (neighborhood && neighborhood.length > 80)) {
    return NextResponse.json(genericError, { status: 400 });
  }

  const supabase = getPublicSupabase();
  if (!supabase) return NextResponse.json({ error: "Signup service is not configured yet." }, { status: 503 });
  const { error } = await supabase.from("interest_signups").insert({ full_name: fullName, phone, contact_channel: contactChannel, neighborhood, materials, consent: true, consented_at: new Date().toISOString() });
  if (error) {
    console.error("Interest signup failed", error.message);
    return NextResponse.json(genericError, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

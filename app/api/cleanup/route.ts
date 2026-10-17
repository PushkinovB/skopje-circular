import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "Cleanup service is not configured." }, { status: 503 });
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  const { data, error } = await supabase.from("interest_signups").delete().is("reviewed_at", null).lt("created_at", cutoff.toISOString()).select("id");
  if (error) {
    console.error("Signup retention cleanup failed", error.message);
    return NextResponse.json({ error: "Cleanup failed." }, { status: 500 });
  }
  return NextResponse.json({ deleted: data?.length ?? 0, cutoff: cutoff.toISOString() }, { headers: { "Cache-Control": "no-store" } });
}

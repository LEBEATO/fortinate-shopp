import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { syncFortniteData } from "@/lib/sync-fortnite";

export const maxDuration = 300;

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sua sessão expirou. Entre novamente para sincronizar." },
      { status: 401 },
    );
  }

  try {
    const result = await syncFortniteData();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Fortnite sync failed", error);
    return NextResponse.json({ error: "Falha ao sincronizar dados." }, { status: 502 });
  }
}

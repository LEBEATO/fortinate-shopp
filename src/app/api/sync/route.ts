import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { syncFortniteData } from "@/lib/sync-fortnite";

export const maxDuration = 300;

function isAuthorized(request: NextRequest) {
  const expected = process.env.SYNC_SECRET;
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !received) return false;
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const result = await syncFortniteData();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Fortnite sync failed", error);
    return NextResponse.json({ error: "Falha ao sincronizar dados." }, { status: 502 });
  }
}

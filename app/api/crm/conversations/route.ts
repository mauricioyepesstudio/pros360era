import { NextResponse } from "next/server";
import { getCRMAccess } from "@/lib/crm/access";
async function unavailable() {
  const access = await getCRMAccess();
  if (access.response) return access.response;
  return NextResponse.json({ error: "Las conversaciones están en preparación." }, { status: 503 });
}
export const GET = unavailable;
export const POST = unavailable;

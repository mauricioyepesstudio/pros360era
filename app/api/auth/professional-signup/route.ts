import { NextResponse } from "next/server";

/** Retired legacy flow: accounts use canonical signup, never self-assign PROFESSIONAL. */
export async function POST() {
  return NextResponse.json({ error: "Crea tu cuenta desde el registro de EVOLUSA. La solicitud profesional se revisa por separado.", signupUrl: "/signup?next=%2Fdashboard%2Fprofessional" }, { status: 410 });
}

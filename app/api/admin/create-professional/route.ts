import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import {
  buildProfessionalProfileInsert,
  buildProfileUpsert,
  parseCreateProfessionalInput,
} from "@/lib/professional/admin-provisioning";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase no está configurado en el servidor" },
        { status: 500 }
      );
    }

    // Same source of truth as getCurrentRole() (lib/account/persistence.ts):
    // profiles.role read under the caller's own session.
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();
    if (!caller) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .maybeSingle();
    if (callerProfile?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const parsed = parseCreateProfessionalInput(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const input = parsed.input;

    // Admin verified above. From here on the service-role client (server
    // only, never serialized to the browser) creates the user without
    // touching the admin's own session cookies.
    const admin = createSupabaseServiceRoleClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Supabase no está configurado en el servidor" },
        { status: 500 }
      );
    }

    // 1. Crear usuario con Supabase Auth (no inicia sesión como el nuevo usuario)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        profession: input.profession,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "No user ID returned" }, { status: 400 });
    }

    // Any failure past this point deletes the new auth user (profiles and
    // professional_profiles cascade from auth.users) so a half-created
    // account never stays behind, and the admin sees the real error.
    const fail = async (step: string, error: { message: string }) => {
      console.error(`create-professional: ${step} failed`, error);
      const { error: rollbackError } = await admin.auth.admin.deleteUser(userId);
      if (rollbackError) {
        console.error("create-professional: rollback failed", rollbackError);
      }
      return NextResponse.json(
        {
          error: `No se pudo crear la cuenta (${step}): ${error.message}`,
          rolledBack: !rollbackError,
        },
        { status: 500 }
      );
    };

    // 2. Marcar el perfil como PROFESSIONAL (el trigger handle_new_user ya creó la fila)
    const { error: profileError } = await admin
      .from("profiles")
      .upsert(buildProfileUpsert(input, userId));
    if (profileError) return fail("profiles", profileError);

    // 3. Crear professional_profile (queda con is_approved = false hasta que un operador lo apruebe)
    const { data: professionalProfile, error: profError } = await admin
      .from("professional_profiles")
      .insert(buildProfessionalProfileInsert(input, userId))
      .select("id, slug")
      .single();
    if (profError) return fail("professional_profiles", profError);

    // Growth Automation no se asigna aquí: la tabla user_services nunca
    // existió y las tablas de Growth (20260929) no están aplicadas.

    return NextResponse.json(
      {
        message: "✅ Cuenta creada exitosamente",
        userId,
        email: input.email,
        professionalProfileId: professionalProfile.id,
        slug: professionalProfile.slug,
        loginUrl: "/",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

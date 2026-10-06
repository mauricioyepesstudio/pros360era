/* eslint-disable @typescript-eslint/no-require-imports -- standalone CommonJS script run with `node` */
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createLauraAccount() {
  const email = "onemigration.us@gmail.com";
  const password = Math.random().toString(36).slice(-16); // Contraseña temporal segura

  try {
    console.log("🔄 Creando usuario para Laura...");

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Laura - One Migration",
        profession: "Gestora de Inmigración",
      },
    });

    if (authError) throw authError;

    const userId = authData.user.id;
    console.log("✅ Usuario Auth creado:", userId);

    // 2. Marcar el perfil como PROFESSIONAL (el trigger handle_new_user ya creó la fila;
    //    profiles no tiene email/full_name/bio/avatar_url, solo name)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      name: "Laura - One Migration",
      role: "PROFESSIONAL",
    });

    if (profileError) throw profileError;
    console.log("✅ Perfil PROFESSIONAL creado");

    // 3. Crear professional_profile con las columnas reales (0005, 0015).
    //    Categoría no regulada; is_approved queda en false hasta que un operador lo apruebe.
    const { error: profError } = await supabase.from("professional_profiles").insert({
      user_id: userId,
      display_name: "One Migration",
      slug: `one-migration-${userId.replace(/-/g, "").slice(0, 6)}`,
      category: "BUSINESS_MARKETING",
      consultation_mode: "BOTH",
      headline: "Gestión de Inmigración",
      bio: "Ayudamos profesionales a gestionar inmigración en EEUU",
      city: "Coral Gables",
      state: "FL",
      website_url: "https://beacons.ai/onemigration/materialgratuito",
      social_links: { instagram: "https://www.instagram.com/onemigration/" },
    });

    if (profError && profError.code !== "23505") throw profError;
    console.log("✅ Professional profile creado");

    // Growth Automation no se asigna aquí: la tabla user_services nunca existió
    // y las tablas de Growth (20260929) no están aplicadas en Supabase.

    console.log("\n" + "=".repeat(60));
    console.log("✅ CUENTA DE LAURA CREADA EXITOSAMENTE");
    console.log("=".repeat(60));
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña temporal: ${password}`);
    console.log(`👤 Role: PROFESSIONAL`);
    console.log("\n⚠️  IMPORTANTE: Laura debe cambiar su contraseña en el login");
    console.log(`🔗 URL para ingresar: http://localhost:3002`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createLauraAccount();

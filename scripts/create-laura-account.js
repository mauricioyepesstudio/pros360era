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

    // 2. Crear perfil PROFESSIONAL
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name: "Laura - One Migration",
      role: "PROFESSIONAL",
      avatar_url: null,
      bio: "Gestora de inmigración en EEUU | Coral Gables, FL",
    });

    if (profileError) throw profileError;
    console.log("✅ Perfil PROFESSIONAL creado");

    // 3. Crear professional_profile
    const { error: profError } = await supabase.from("professional_profiles").insert({
      user_id: userId,
      business_name: "One Migration",
      niche: "Gestión de Inmigración",
      location: "Coral Gables, FL, United States",
      website: "https://beacons.ai/onemigration/materialgratuito",
      instagram: "https://www.instagram.com/onemigration/",
      bio: "Ayudamos profesionales a gestionar inmigración en EEUU",
    });

    if (profError && profError.code !== "23505") throw profError;
    console.log("✅ Professional profile creado");

    // 4. Crear servicio Growth Automation
    const { error: serviceError } = await supabase.from("user_services").insert({
      user_id: userId,
      service_id: "growth-automation",
      status: "active",
      settings: {
        niche: "Gestión de Inmigración",
        target_audience: "Personas que necesitan gestión de inmigración",
        revenue_split: 70,
      },
    });

    if (serviceError && serviceError.code !== "23505") throw serviceError;
    console.log("✅ Servicio Growth Automation asignado");

    console.log("\n" + "=".repeat(60));
    console.log("✅ CUENTA DE LAURA CREADA EXITOSAMENTE");
    console.log("=".repeat(60));
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña temporal: ${password}`);
    console.log(`👤 Role: PROFESSIONAL`);
    console.log(`🚀 Growth Automation: ACTIVADO`);
    console.log("\n⚠️  IMPORTANTE: Laura debe cambiar su contraseña en el login");
    console.log(`🔗 URL para ingresar: http://localhost:3002`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createLauraAccount();

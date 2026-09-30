#!/bin/bash

# Variables
EMAIL="onemigration.us@gmail.com"
PASSWORD="1Migration_Laura2024!"
SUPABASE_URL="https://ovialqdazxkekvqqgdiu.supabase.co"
ANON_KEY="sb_publishable_aTLWl1pUGagX0S_Rz5Nn6g_2pJBizF4"

echo "🔄 Creando cuenta para 1MIGRATION..."

# 1. Crear usuario en Auth (sin confirmar email aún)
USER_ID=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"full_name\": \"1MIGRATION - Laura\",
      \"brand\": \"1MIGRATION\"
    }
  }" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ Error creando usuario. Verifica las credenciales."
  exit 1
fi

echo "✅ Usuario creado: $USER_ID"

# Nota: Los datos de perfiles se deben insertar con la clave de servicio
# Esta es una limitación de seguridad de Supabase
echo ""
echo "⚠️  Para completar el perfil, ejecuta en Supabase SQL Editor:"
echo ""
echo "-- 1. Crear perfil PROFESSIONAL"
echo "INSERT INTO public.profiles (id, email, full_name, role) VALUES"
echo "('$USER_ID', '$EMAIL', '1MIGRATION - Laura', 'PROFESSIONAL');"
echo ""
echo "-- 2. Crear professional_profile (marca propia)"
echo "INSERT INTO public.professional_profiles (user_id, business_name, niche, location, instagram, website) VALUES"
echo "('$USER_ID', '1MIGRATION', 'Gestión de Inmigración en EEUU', 'Coral Gables, FL', 'https://www.instagram.com/onemigration/', 'https://beacons.ai/onemigration/');"
echo ""
echo "-- 3. Asignar Growth Automation"
echo "INSERT INTO public.user_services (user_id, service_id, status) VALUES"
echo "('$USER_ID', 'growth-automation', 'active');"

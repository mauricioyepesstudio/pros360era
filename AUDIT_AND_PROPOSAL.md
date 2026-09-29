# Auditoría de Flujos EvolUSA y Propuesta de Mejora

**Objetivo:** Hacer completamente comprensible cómo funciona EvolUSA para sus dos participantes:
- **A. Persona que necesita un servicio (Usuario/Miembro)**
- **B. Profesional que presta el servicio**

---

## 📊 AUDITORÍA DE ESTADO ACTUAL

### ✅ FLUJOS COMPLETAMENTE IMPLEMENTADOS

#### USUARIO (Miembro):
1. **Identificación de necesidad**
   - ✅ `/` → `StageSelector` (6 etapas del roadmap)
   - ✅ `/onboarding` → `OnboardingFlow` (preguntas + recomendaciones)
   - ✅ Identificación de life events

2. **Orientación inicial**
   - ✅ `/dashboard` → RoadmapBoard con acciones ahora/semana/próximamente
   - ✅ Life events contextuales
   - ✅ Progress tracking (%)

3. **Búsqueda de profesionales**
   - ✅ `/profesionales` → ProfessionalsDirectory (filtrable)
   - ✅ `/profesionales/[slug]` → Perfil público de profesional
   - ✅ Profesionales verificados (badge)

4. **Gestión de servicios**
   - ✅ `/conexiones` → Oportunidades propias (routed opportunities)
   - ✅ `/conexiones/nueva` → Crear nueva oportunidad
   - ✅ Estado de oportunidad (ROUTED, CONTACTED, COMPLETED, DECLINED, EXPIRED)

5. **Panel de cuenta**
   - ✅ `/dashboard` → Resumen
   - ✅ `/roadmap` → Todas las acciones
   - ✅ `/profile` → Editar perfil personal
   - ✅ `/assistant` → Chat con EVOLUSA AI
   - ✅ `/plan-credito` → Guía de crédito

#### PROFESIONAL:
1. **Aplicación**
   - ✅ `/aplicar-profesional` → Formulario de aplicación
   - ✅ Categorías aceptadas (BUSINESS_MARKETING, BUSINESS_OPERATIONS, NOTARY)

2. **Verificación**
   - ✅ En base de datos (professional_verifications tabla)
   - ⚠️ Sin flujo de verificación visual en UI

3. **Perfil profesional**
   - ✅ `/panel-profesional/perfil` → Editor de perfil auto-servicio
   - ✅ Campos: nombre, headline, bio, ubicación, idiomas, modo consulta, URLs
   - ✅ Social links (Instagram, Facebook, LinkedIn, X, TikTok)
   - ✅ Work samples (portfolio)

4. **Recepción de oportunidades**
   - ✅ `/panel-profesional/oportunidades` → Oportunidades routed

5. **Gestión de servicios**
   - ⚠️ Ver oportunidades sí, pero citar y gestionar está parcial

6. **Reputación**
   - ⚠️ Sistema de ratings/reseñas no implementado

---

### ⚠️ PARCIALMENTE IMPLEMENTADO

| Característica | Estado | Detalles |
|---|---|---|
| Mensajería | ⚠️ | No hay chat integrado entre usuario y profesional |
| Citas/Booking | ⚠️ | Campo `booking_url` en perfil, pero sin sistema integrado |
| Documentos compartidos | ❌ | No existe |
| Pago/Transacciones | ⚠️ | Stripe integrado pero sin flujo de cobro completo |
| Notificaciones | ❌ | Manual ("revisa periódicamente") |
| Ratings/Reseñas | ❌ | No existe |
| Verificación profesional | ⚠️ | Existe en DB, sin flujo de verificación visual |

---

### 🚧 COMPLETAMENTE FALTANTE

1. **Flujo de cotización** - profesional puede cotizar ofertas
2. **Ciclo de vida de cotización** - usuario acepta/rechaza cotización
3. **Mensajería entre partes** - comunicación integrada
4. **Sistema de calificaciones** - usuario califica profesional
5. **Historial de transacciones** - profesional ve historial completo
6. **Notificaciones en tiempo real** - updates automáticas
7. **Educación sobre verificación** - qué significa "verificado en EVOLUSA"

---

## 🗺️ FLUJOS DESEADOS

### USUARIO (Miembro) - Viaje Completo

```
1. IDENTIFICAR NECESIDAD
   ↓
   / → Hero + StageSelector (6 etapas)
   Selecciona etapa → StageServices (servicios recomendados)
   
2. RECIBIR ORIENTACIÓN
   ↓
   /onboarding → Responde preguntas
   ↓
   /dashboard → Ver roadmap + acciones
   
3. ENCONTRAR PROFESIONALES
   ↓
   /profesionales → Directorio filtrable
   ↓
   /profesionales/[slug] → Perfil, verificación, reviews
   
4. ENVIAR SOLICITUD/COTIZACIÓN
   ↓
   /conexiones/nueva → Crear oportunidad
   ↓
   Profesional recibe notificación
   ↓
   Profesional cotiza
   
5. GESTIONAR SERVICIO
   ↓
   /conexiones → Ver estado, mensajes, documentos
   ↓
   Chat con profesional
   ↓
   Compartir documentos
   ↓
   Agendar cita (si aplica)
   
6. FINALIZAR Y EVALUAR
   ↓
   Marcar como completado
   ↓
   Calificar profesional + reseña
   ↓
   /dashboard → Ver siguiente paso en roadmap
```

### PROFESIONAL - Viaje Completo

```
1. APLICAR
   ↓
   /aplicar-profesional → Formulario
   ↓
   Sistema envía para verificación
   
2. SER VERIFICADO
   ↓
   [Backend process]
   ↓
   Email: "Perfil aprobado" + link a /panel-profesional/perfil
   
3. COMPLETAR PERFIL
   ↓
   /panel-profesional/perfil → Datos completos
   ↓
   Agregar servicios, rates, availabilidad
   ↓
   Perfil aparece en /profesionales
   
4. RECIBIR OPORTUNIDADES
   ↓
   /panel-profesional/oportunidades → Nueva oportunidad
   ↓
   Notificación: "Nuevo cliente que te busca"
   
5. COTIZAR Y GESTIONAR
   ↓
   /oportunidades/[id] → Ver perfil del cliente
   ↓
   /oportunidades/[id]/cotizar → Enviar cotización
   ↓
   Chat con cliente
   ↓
   Compartir documentos
   
6. COMPLETAR Y CONSTRUIR REPUTACIÓN
   ↓
   Marcar trabajo como completado
   ↓
   Cliente califica
   ↓
   Reputación sube
   ↓
   Más oportunidades llegan
```

---

## 🎯 DIFF PROPUESTO (SIN HACER CAMBIOS AÚN)

### 1. HOMEPAGE REDISEÑADA - `app/page.tsx`

**CAMBIOS:**
- Reemplazar/modificar `Hero` → Mostrar dos caminos claros desde el inicio
- Modificar `CTA` → Dos botones principales (no uno)
- Reordenar secciones para claridad dual

**ESTRUCTURA PROPUESTA:**

```
HOME FLOW DUAL:

┌─────────────────────────────────────┐
│  Header (mantener)                  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Hero Rediseñado (2 caminos claros) │
├─────────────────────────────────────┤
│  "Necesito ayuda"  │  "Soy profesional" │
│  ↓ /onboarding    │  ↓ /aplicar-prof  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Sección: "Para usuarios..."        │
│  - Cómo funciona (usuario journey)  │
│  - Etapas del roadmap (6)           │
│  - Profesionales disponibles        │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Sección: "Para profesionales..."   │
│  - Modelo de negocio               │
│  - Casos de éxito                  │
│  - CTA: "Aplicar ahora"            │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Confianza (mantener)               │
├─────────────────────────────────────┤
│  - Verificación real                │
│  - Conexiones directas              │
│  - Sin comisiones fijas             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  FAQ (mantener)                     │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Footer (mantener)                  │
└─────────────────────────────────────┘
```

**NUEVAS SECCIONES A CREAR:**
- `UserJourneyOverview.tsx` - Explica viaje del usuario
- `ProfessionalJourneyOverview.tsx` - Explica viaje del profesional

**SECCIONES A MANTENER:**
- `Hero` → modificado
- `StageSelector` → Movido a sección de usuario
- `StageServices` → Movido a sección de usuario
- `HowItWorks` → Reorientado para usuarios
- `TrustAndTransparency` → Mantener
- `FAQ` → Mantener
- `Footer` → Mantener

---

### 2. HEADER MEJORADO - `components/layout/SiteHeader.tsx`

**CAMBIOS:**
- Cambiar CTA único "Descubre tu próximo paso" por:
  - "Necesito ayuda" → `/onboarding`
  - "Soy profesional" → `/aplicar-profesional`

**CÓDIGO PROPUESTO:**

```tsx
// Línea 104-112: CAMBIO
{/* De:
<ButtonLink href="/onboarding" className="px-5">
  Descubre tu próximo paso
  <ArrowRight aria-hidden className="ml-2" size={16} />
</ButtonLink>

A:
*/}

<div className="flex gap-3">
  <Link href="/login" className={cn("px-5 py-2.5 rounded font-semibold...")}>
    Entrar
  </Link>
  <ButtonLink href="/onboarding" className="px-5">
    Necesito ayuda
    <ArrowRight aria-hidden className="ml-2" size={16} />
  </ButtonLink>
  <ButtonLink href="/aplicar-profesional" className="px-5" variant="secondary">
    Soy profesional
  </ButtonLink>
</div>
```

---

### 3. DOCUMENTACIÓN CLARA EN INICIO - Nuevas secciones

**ARCHIVO: `sections/home/UserJourneyFlow.tsx`**

```
Mostrar visualmente:
1. Identificar necesidad → 2. Encontrar profesional → 
3. Enviar solicitud → 4. Recibir cotización → 5. Completar → 6. Evaluar
```

**ARCHIVO: `sections/home/ProfessionalJourneyFlow.tsx`**

```
Mostrar visualmente:
1. Aplicar → 2. Ser verificado → 3. Completar perfil →
4. Recibir oportunidades → 5. Cotizar → 6. Construir reputación
```

---

### 4. NAVEGACIÓN AUTENTICADA - `components/account/AccountShell.tsx`

**CAMBIO PROPUESTO:** Agregar separadores visuales entre "Usuario" y "Profesional"

```tsx
// Tabs grupo "Usuario":
- Inicio
- Conexiones (Oportunidades propias)
- Roadmap
- Asistente
- Perfil
- Plan de Crédito

// Separador visual

// Tabs grupo "Profesional" (si rol === PROFESSIONAL):
- Panel profesional
  - Oportunidades
  - Mi perfil profesional
```

---

## 📝 MATRIZ DE ESTADOS

### LO QUE YA FUNCIONA ✅

| Componente | Usuario | Profesional | Estado |
|---|:---:|:---:|---|
| Autenticación | ✅ | ✅ | Login/signup completo |
| Perfil propio | ✅ | ✅ | Edición completa |
| Directorio | ✅ | ✅ | Búsqueda con filtros |
| Oportunidades (ver) | ✅ | ✅ | Lectura completa |
| Roadmap | ✅ | ❌ | Solo usuario |
| AI Assistant | ✅ | ❌ | Solo usuario |

### LO PARCIALMENTE IMPLEMENTADO ⚠️

| Característica | Usuario | Profesional | Falta |
|---|:---:|:---:|---|
| Crear oportunidad | ✅ | N/A | (OK) |
| Cotizar | N/A | ⚠️ | UI/flujo |
| Mensajería | ⚠️ | ⚠️ | Sistema integrado |
| Citas | ⚠️ | ⚠️ | Sistema integrado |

### LO QUE COMPLETAMENTE FALTA ❌

| Característica | Usuario | Profesional | Prioridad |
|---|:---:|:---:|---|
| Calificaciones | ❌ | ❌ | ALTA |
| Notificaciones | ❌ | ❌ | ALTA |
| Historial | ❌ | ❌ | MEDIA |
| Documentos compartidos | ❌ | ❌ | MEDIA |

---

## 🎨 VISUALIZACIÓN: HOMEPAGE REDISEÑADA

```
┌──────────────────────────────────────────────┐
│ HEADER                                       │
│ [Logo] [Nav] [Entrar] [Necesito ayuda] [Soy profesional]
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ HERO DUAL                                    │
├────────────────────┬────────────────────────┤
│  Para usuarios     │  Para profesionales    │
│                    │                        │
│ Identifica tu      │ Ofrece tus servicios   │
│ necesidad y        │ a clientes que te      │
│ conecta con        │ buscan específicamente │
│ profesionales      │                        │
│ verificados        │                        │
│                    │                        │
│ [Necesito ayuda]   │ [Quiero aplicar]      │
└────────────────────┴────────────────────────┘

┌──────────────────────────────────────────────┐
│ PARA USUARIOS                                │
├──────────────────────────────────────────────┤
│ Cómo funciona tu camino:                     │
│                                              │
│ 1. Identificar → 2. Orientación →            │
│ 3. Encontrar → 4. Solicitar →                │
│ 5. Gestionar → 6. Evaluar                    │
│                                              │
│ [Ver directorio] [Empezar onboarding]       │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ PARA PROFESIONALES                           │
├──────────────────────────────────────────────┤
│ Cómo creces tu reputación:                   │
│                                              │
│ 1. Aplicar → 2. Verificación →               │
│ 3. Completar → 4. Recibir clientes →         │
│ 5. Cotizar → 6. Construir reputación         │
│                                              │
│ [Ver modelo] [Aplicar ahora]                 │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ CONFIANZA (mantener)                        │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ FAQ (mantener)                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ FOOTER (mantener)                           │
└──────────────────────────────────────────────┘
```

---

## 📋 RESUMEN: PRÓXIMOS PASOS

### ANTES DE EDITAR:
1. ✅ Auditoría completada
2. ✅ Flujos documentados
3. ✅ Diff propuesto presentado
4. ⏳ ESPERAR APROBACIÓN

### PRIMEROS CAMBIOS (si se aprueban):
1. **Homepage** - Crear Hero dual y reordenar secciones
2. **Header** - Cambiar CTA a dos botones
3. **Documentación** - Crear nuevas secciones de flow
4. **Navegación** - Mejorar visualización de roles

### LUEGO (segundo sprint):
1. Implementar sistema de notificaciones
2. Agregar cotizaciones
3. Sistema de mensajería básica
4. Calificaciones y reseñas

---

## ⚡ STATUS

- **Rama actual:** `integration/evolusa-main-reconciliation-20260924` ✅ PUSHEADA
- **Verificaciones:** typecheck ✅, lint ✅, tests ✅, build ✅
- **Ready to apply:** NO - esperando aprobación de diff propuesto


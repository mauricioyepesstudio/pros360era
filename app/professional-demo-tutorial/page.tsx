"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: 1,
    title: "Conecta tu Instagram",
    description: "Solo necesitas dar permisos una sola vez. El sistema se conecta de forma segura a tu cuenta.",
    details: [
      "✅ No compartimos tu contraseña",
      "✅ No publicamos sin tu aprobación",
      "✅ Puedes desconectar en cualquier momento"
    ],
    color: "#2563EB"
  },
  {
    number: 2,
    title: "El sistema comienza a trabajar",
    description: "Inmediatamente después, nuestros agentes de IA comienzan a crear contenido optimizado para tu nicho.",
    details: [
      "✅ 2-3 posts diarios automáticos",
      "✅ Basados en tendencias reales",
      "✅ Optimizados para máximo engagement"
    ],
    color: "#2563EB"
  },
  {
    number: 3,
    title: "Captura automática de leads",
    description: "El sistema monitorea todas tus plataformas 24/7 y captura leads de manera inteligente.",
    details: [
      "✅ Instagram (comentarios, DMs)",
      "✅ WhatsApp (mensajes)",
      "✅ Email (consultas)"
    ],
    color: "#2563EB"
  },
  {
    number: 4,
    title: "CRM Automático",
    description: "Todos los leads aparecen en un solo lugar, calificados por probabilidad de compra.",
    details: [
      "✅ Leads organizados automáticamente",
      "✅ Calificación inteligente (HOT/Warm)",
      "✅ Nada que hacer manualmente"
    ],
    color: "#2563EB"
  },
  {
    number: 5,
    title: "Tú atiendes los leads",
    description: "Solo necesitas responder a los leads que te interesen. El sistema hace el resto.",
    details: [
      "✅ Responde cuando quieras",
      "✅ Desde tu teléfono o computadora",
      "✅ Sin compromisos"
    ],
    color: "#2563EB"
  },
  {
    number: 6,
    title: "Propuestas automáticas",
    description: "El sistema puede sugerirte propuestas basadas en lo que necesita cada lead.",
    details: [
      "✅ Personalizadas por lead",
      "✅ Basadas en su intención",
      "✅ Tú decides si usarlas"
    ],
    color: "#2563EB"
  },
  {
    number: 7,
    title: "Cierras tus ventas",
    description: "Tú haces lo que sabes hacer mejor: cerrar clientes y darles un excelente servicio.",
    details: [
      "✅ Ganas 70% de cada venta",
      "✅ Nosotros nos quedamos con 30%",
      "✅ Para mantener el sistema funcionando"
    ],
    color: "#2563EB"
  },
  {
    number: 8,
    title: "Dashboard en tiempo real",
    description: "Ves todo lo que está pasando: posts, leads, conversiones, ingresos. Todo en un lugar.",
    details: [
      "✅ Actualizaciones en vivo",
      "✅ Analytics detallados",
      "✅ Proyecciones futuras"
    ],
    color: "#2563EB"
  },
  {
    number: 9,
    title: "Resultados en 30 días",
    description: "Esto es lo que esperas después de tu primer mes con el sistema.",
    details: [
      "✅ +200 nuevos seguidores",
      "✅ 18-20 leads calificados",
      "✅ $3,500+ en tu bolsillo (70%)"
    ],
    color: "#F20D24"
  }
];

export default function ProfessionalDemoTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: '#061B3A', borderBottom: '3px solid #F20D24' }}>
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link href="/professional-demo">
            <div className="text-xl font-bold" style={{ color: '#F20D24' }}>← Volver</div>
          </Link>
          <div style={{ color: '#EFF6FF' }}>
            Paso {currentStep + 1} de {steps.length}
          </div>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                backgroundColor: step.color,
                width: `${((currentStep + 1) / steps.length) * 100}%`
              }}
            ></div>
          </div>
          <p className="text-sm mt-2" style={{ color: '#64748B' }}>
            {currentStep + 1} de {steps.length}
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-lg p-12 mb-12" style={{ backgroundColor: 'white', border: `3px solid ${step.color}` }}>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              style={{ backgroundColor: step.color }}
            >
              {step.number}
            </div>
            <div>
              <h2 className="text-4xl font-bold" style={{ color: '#061B3A' }}>
                {step.title}
              </h2>
            </div>
          </div>

          <p className="text-xl mb-8" style={{ color: '#064748B' }}>
            {step.description}
          </p>

          <div className="space-y-4">
            {step.details.map((detail, idx) => (
              <p key={idx} className="text-lg font-semibold" style={{ color: '#061B3A' }}>
                {detail}
              </p>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-between items-center mb-12">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              backgroundColor: currentStep === 0 ? '#E0E0E0' : '#2563EB',
              color: 'white'
            }}
          >
            <ChevronLeft size={24} />
            Anterior
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              backgroundColor: currentStep === steps.length - 1 ? '#E0E0E0' : '#F20D24',
              color: 'white'
            }}
          >
            Siguiente
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Final CTA */}
        {currentStep === steps.length - 1 && (
          <div className="rounded-lg p-8 text-center text-white" style={{ backgroundColor: '#061B3A' }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#F20D24' }}>
              ¿Listo para empezar?
            </h3>
            <p className="mb-6" style={{ color: '#EFF6FF' }}>
              Completa tu registro en 5 minutos y comienza a ver resultados en 30 días.
            </p>
            <Link
              href="/signup?professional_invite=true"
              className="inline-block px-10 py-4 rounded-lg font-bold text-lg"
              style={{ backgroundColor: '#F20D24', color: 'white' }}
            >
              Crear mi Cuenta Ahora
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

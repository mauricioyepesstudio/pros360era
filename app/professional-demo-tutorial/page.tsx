"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    "number": 1,
    "title": "Revisa tus conexiones",
    "description": "Las conexiones externas requieren autorización individual y disponibilidad del proveedor.",
    "details": [
      "El acceso depende de cada canal",
      "Revisa los permisos antes de conectar"
    ],
    "color": "var(--brand-blue)"
  },
  {
    "number": 2,
    "title": "Prepara tu contenido",
    "description": "Organiza borradores en el planner y revisa el texto y las piezas antes de usarlos.",
    "details": [
      "La generación con IA requiere proveedor y cuota disponibles",
      "Crear un borrador no publica en redes"
    ],
    "color": "var(--brand-blue)"
  },
  {
    "number": 3,
    "title": "Organiza tus contactos",
    "description": "Registra y revisa contactos en el CRM del panel profesional.",
    "details": [
      "La captura desde canales externos requiere una integración verificada",
      "No se promete monitoreo automático"
    ],
    "color": "var(--brand-blue)"
  },
  {
    "number": 4,
    "title": "Da seguimiento",
    "description": "Revisa cada contacto y registra el siguiente paso según tu trabajo real.",
    "details": [
      "La atención y el seguimiento requieren tu participación",
      "No se promete una probabilidad de compra"
    ],
    "color": "var(--brand-blue)"
  },
  {
    "number": 5,
    "title": "Revisa tus oportunidades",
    "description": "Las solicitudes dependen de necesidades reales, la categoría y la elegibilidad de tu perfil.",
    "details": [
      "La aprobación del perfil y la identidad verificada son distintas",
      "No se garantiza un volumen de solicitudes"
    ],
    "color": "var(--brand-blue)"
  },
  {
    "number": 6,
    "title": "Prepara tus propuestas",
    "description": "Revisa y adapta cada propuesta al alcance que realmente puedes ofrecer.",
    "details": [
      "Los borradores necesitan revisión antes de compartir",
      "Las herramientas de IA requieren configuración disponible"
    ],
    "color": "var(--brand-blue)"
  },
  {
    "number": 7,
    "title": "Acuerda el servicio",
    "description": "La contratación y las condiciones del servicio se acuerdan con el cliente.",
    "details": [
      "No se prometen ventas ni ingresos",
      "Los servicios regulados mantienen sus requisitos"
    ],
    "color": "var(--brand-blue)"
  },
  {
    "number": 8,
    "title": "Consulta tu panel",
    "description": "Revisa los registros disponibles de publicaciones, contactos y solicitudes.",
    "details": [
      "Una publicación externa requiere comprobante del canal",
      "Solo los datos comprobados sirven como resultado"
    ],
    "color": "var(--brand-blue)"
  },
  {
    "number": 9,
    "title": "Evalúa tu avance",
    "description": "Revisa las actividades realizadas y decide el siguiente paso con datos disponibles.",
    "details": [
      "Las métricas externas dependen de conexiones verificadas",
      "No hay un plazo garantizado de resultados"
    ],
    "color": "var(--brand-coral)"
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
              Revisa las herramientas disponibles y envía tu solicitud profesional.
            </p>
            <Link
              href="/aplicar-profesional"
              className="inline-block px-10 py-4 rounded-lg font-bold text-lg"
              style={{ backgroundColor: '#F20D24', color: 'white' }}
            >
              Enviar mi solicitud
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

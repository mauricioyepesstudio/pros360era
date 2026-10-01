"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const tutorialSteps = [
  {
    number: 1,
    title: "Accede al Dashboard",
    description: "Asegúrate de estar en la sección 'Crecimiento Automático'",
    action: "Busca el botón azul en el menú lateral",
  },
  {
    number: 2,
    title: "Sube tu Calendario",
    description: "Copia la información de tu Google Doc con pilares e ideas",
    action: "Pega los pilares y contenido en la sección 'Mis Pilares'",
  },
  {
    number: 3,
    title: "Genera Posts",
    description: "Selecciona cuántos posts y qué pilares usar",
    action: "2-3 posts diarios para máximo engagement",
  },
  {
    number: 4,
    title: "Revisa los Posts",
    description: "Cada post tiene opciones: Aprobar, Regenerar, Editar",
    action: "Solo aprueba los que te gusten",
  },
  {
    number: 5,
    title: "Publica Automáticamente",
    description: "Los posts se publican solos en Instagram 2-3 veces al día",
    action: "¡Tú solo responde a los leads que lleguen!",
  },
];

export default function TutorialGenerarContenido() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
        style={{
          backgroundColor: "#F20D24",
          color: "white",
        }}
      >
        ❓ ¿Cómo generar contenido?
      </button>
    );
  }

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg max-w-2xl w-full"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ backgroundColor: "#061B3A", borderBottom: "3px solid #F20D24" }}
        >
          <h2 className="text-xl font-bold" style={{ color: "#F20D24" }}>
            Tutorial: Generar Contenido
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
          >
            <X size={24} style={{ color: "#EFF6FF" }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  backgroundColor: "#F20D24",
                  width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-sm mt-2" style={{ color: "#64748B" }}>
              Paso {currentStep + 1} de {tutorialSteps.length}
            </p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: "#F20D24" }}
              >
                {step.number}
              </div>
              <h3 className="text-3xl font-bold" style={{ color: "#061B3A" }}>
                {step.title}
              </h3>
            </div>

            <p className="text-lg mb-4" style={{ color: "#475569" }}>
              {step.description}
            </p>

            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#EFF6FF",
                borderLeft: "4px solid #2563EB",
              }}
            >
              <p className="font-semibold" style={{ color: "#061B3A" }}>
                💡 {step.action}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
              style={{
                backgroundColor: currentStep === 0 ? "#E0E0E0" : "#2563EB",
                color: "white",
              }}
            >
              <ChevronLeft size={20} />
              Anterior
            </button>

            <button
              onClick={() =>
                setCurrentStep(Math.min(tutorialSteps.length - 1, currentStep + 1))
              }
              disabled={currentStep === tutorialSteps.length - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
              style={{
                backgroundColor:
                  currentStep === tutorialSteps.length - 1 ? "#E0E0E0" : "#F20D24",
                color: "white",
              }}
            >
              Siguiente
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Final Message */}
          {currentStep === tutorialSteps.length - 1 && (
            <div
              className="mt-8 p-6 rounded-lg text-center"
              style={{ backgroundColor: "#061B3A" }}
            >
              <h4 className="text-2xl font-bold mb-3" style={{ color: "#F20D24" }}>
                ¡Listo para empezar!
              </h4>
              <p className="mb-4" style={{ color: "#EFF6FF" }}>
                En 30 días vas a tener +200 seguidores y 18-20 leads. Vamos a romperla. 🚀
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-8 py-3 rounded-lg font-bold"
                style={{ backgroundColor: "#F20D24", color: "white" }}
              >
                Empezar Ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

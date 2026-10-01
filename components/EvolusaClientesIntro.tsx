"use client";

export default function EvolusaClientesIntro() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-8 rounded-lg mb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido a EVOLUSA ✨
        </h2>
        <p className="text-lg text-gray-600">
          Conecta con profesionales verificados que pueden ayudarte
        </p>
      </div>

      {/* Explicación */}
      <div className="space-y-4 mb-8">
        <p className="text-gray-700 leading-relaxed">
          <strong>EVOLUSA es tu plataforma para encontrar y conectarse con profesionales</strong>
          especializados en lo que necesitas. Te guiamos en cada paso del proceso.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-bold text-gray-900 mb-2">Busca Profesionales</h3>
            <p className="text-sm text-gray-600">
              Encuentra expertos verificados en tu área de interés
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-bold text-gray-900 mb-2">Sigue el Proceso</h3>
            <p className="text-sm text-gray-600">
              Guía paso a paso para conectarte correctamente
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-bold text-gray-900 mb-2">Conecta Directo</h3>
            <p className="text-sm text-gray-600">
              Comunícate directamente con el profesional que elijas
            </p>
          </div>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="bg-white p-6 rounded-lg border border-green-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Explora categorías de servicios</p>
              <p className="text-sm text-gray-600">Inmigración, Impuestos, Negocios, y más</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Selecciona un profesional</p>
              <p className="text-sm text-gray-600">Lee su perfil, experiencia y especialidades</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">Responde preguntas guiadas</p>
              <p className="text-sm text-gray-600">Nos ayuda a entender tu situación específica</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              4
            </div>
            <div>
              <p className="font-semibold text-gray-900">Conecta con el profesional</p>
              <p className="text-sm text-gray-600">El profesional se conecta contigo y comienzas tu proceso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Por qué EVOLUSA */}
      <div className="mt-6 bg-green-100 p-4 rounded-lg">
        <h3 className="font-bold text-gray-900 mb-3">¿Por qué usar EVOLUSA?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Profesionales verificados:</strong> Solo expertos calificados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Proceso guiado:</strong> Te acompañamos en cada paso</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Comunicación directa:</strong> Sin intermediarios</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Confianza y transparencia:</strong> Sabes exactamente con quién trabajas</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import EvolusaProfesionalesIntro from "./EvolusaProfesionalesIntro";
import EvolusaClientesIntro from "./EvolusaClientesIntro";

type UserType = "profesional" | "cliente" | null;

export default function EvolusaIntroSelector() {
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detectar tipo de usuario desde:
    // 1. localStorage (si está guardado)
    // 2. URL/ruta actual
    // 3. Rol del usuario en la sesión

    try {
      // Verificar localStorage
      const savedUserType = localStorage.getItem("userType");
      if (savedUserType === "profesional" || savedUserType === "cliente") {
        setUserType(savedUserType);
        setLoading(false);
        return;
      }

      // Verificar desde la ruta actual
      const currentPath = window.location.pathname;

      // Si está en rutas de profesional
      if (
        currentPath.includes("profesional") ||
        currentPath.includes("account") ||
        currentPath.includes("dashboard") ||
        currentPath.includes("crm") ||
        currentPath.includes("growth")
      ) {
        setUserType("profesional");
        localStorage.setItem("userType", "profesional");
      }
      // Si está en rutas de cliente
      else if (
        currentPath.includes("buscar") ||
        currentPath.includes("cliente") ||
        currentPath.includes("servicios") ||
        currentPath.includes("encontrar")
      ) {
        setUserType("cliente");
        localStorage.setItem("userType", "cliente");
      }
      // Por defecto (primera vez): mostrar selector
      else {
        setUserType(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error detecting user type:", error);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return null; // No mostrar nada mientras carga
  }

  // Si es profesional, mostrar su intro
  if (userType === "profesional") {
    return <EvolusaProfesionalesIntro />;
  }

  // Si es cliente, mostrar su intro
  if (userType === "cliente") {
    return <EvolusaClientesIntro />;
  }

  // Si no se detectó, mostrar selector
  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-lg mb-8 border border-slate-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Bienvenido a EVOLUSA 👋
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Antes de continuar, cuéntanos: ¿Quién eres?
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Opción Profesional */}
        <button
          onClick={() => {
            setUserType("profesional");
            localStorage.setItem("userType", "profesional");
            window.location.href = "/profesionales";
          }}
          className="group p-8 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="text-4xl mb-4">👨‍💼</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
            Soy Profesional
          </h3>
          <p className="text-gray-600 mb-4">
            Quiero generar contenido automático, capturar clientes y crecer mi negocio
          </p>
          <div className="text-sm text-blue-600 font-semibold group-hover:text-blue-700">
            Continuar →
          </div>
        </button>

        {/* Opción Cliente */}
        <button
          onClick={() => {
            setUserType("cliente");
            localStorage.setItem("userType", "cliente");
            window.location.href = "/buscar-profesional";
          }}
          className="group p-8 bg-white border-2 border-green-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600">
            Soy Cliente
          </h3>
          <p className="text-gray-600 mb-4">
            Busco un profesional que me ayude con mis trámites y procesos
          </p>
          <div className="text-sm text-green-600 font-semibold group-hover:text-green-700">
            Continuar →
          </div>
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center mt-8">
        Puedes cambiar esto después en tu perfil
      </p>
    </div>
  );
}

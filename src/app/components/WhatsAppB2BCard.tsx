"use client";

import React from "react";
import { Headphones, ShieldCheck } from "lucide-react";

interface WhatsAppB2BCardProps {
  numeroTelefono?: string;
  pbxTexto?: string;
}

export default function WhatsAppB2BCard({
  numeroTelefono = "50322008800",
  pbxTexto = "+503 2200-8800",
}: WhatsAppB2BCardProps) {
  // Mensaje preconfigurado enfocado en asesoría técnica y compatibilidad de productos
  const mensajeWhatsApp = encodeURIComponent(
    "Hola Techsmart B2B, solicito asesoría técnica sobre componentes del catálogo. Tengo dudas sobre compatibilidad y especificaciones para un proyecto."
  );

  const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeWhatsApp}`;

  return (
    <div className="bg-gradient-to-br from-[#0c1f3f] via-[#091730] to-[#061022] rounded-2xl p-5 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
      {/* Resplandor decorativo de fondo */}
      <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Cabecera con icono */}
      <div className="flex items-center gap-2">
        <Headphones className="w-5 h-5 text-sky-400 shrink-0" />
        <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight">
          Asesoría Técnica de Productos
        </h3>
      </div>

      {/* Descripción orientada a dudas y compatibilidad de componentes */}
      <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
        ¿Tienes dudas sobre compatibilidad de memorias, sockets de CPU, arreglos de discos o qué componente conviene a tu infraestructura? Nuestro equipo de preventa te orienta directamente.
      </p>

      {/* Barra inferior: PBX y Botón WhatsApp */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-blue-900/60">
        <div className="text-xs text-slate-300">
          <span className="text-slate-400">PBX: </span>
          <strong className="font-mono text-white">{pbxTexto}</strong>
        </div>

        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#00c957] hover:bg-[#00b04c] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-emerald-950/40 transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Icono vectorial de WhatsApp */}
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
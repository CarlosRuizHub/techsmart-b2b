"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/src/lib/CartContext";

// Abre el modal de acceso si la URL viene con ?auth=login y no hay sesión.
// Va aparte y dentro de <Suspense> porque Next exige ese límite para useSearchParams
// (si no, falla el prerender de "/" en `next build`).
function AbrirAccesoDesdeUrl() {
  const searchParams = useSearchParams();
  const { openAuthModal, currentUser } = useCart();

  useEffect(() => {
    if (searchParams.get("auth") === "login" && !currentUser) {
      const frame = requestAnimationFrame(() => openAuthModal());
      return () => cancelAnimationFrame(frame);
    }
    // openAuthModal es estable en la práctica; no se incluye para no reabrir el modal en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentUser]);

  return null;
}

// El inicio de sesión y el registro los maneja el AuthModal global (layout.tsx)
// con Firebase Authentication. Esta página solo lo abre.
export default function LandingB2BPage() {
  const router = useRouter();
  const { openCheckout, openAuthModal, currentUser } = useCart();

  // Con sesión iniciada el botón lleva directo al catálogo
  const ingresarAlPortal = () => {
    if (currentUser) {
      router.push("/catalogo");
    } else {
      openAuthModal();
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      <Suspense fallback={null}>
        <AbrirAccesoDesdeUrl />
      </Suspense>

      {/* 1. Hero Section - Hub Logístico */}
      <section className="relative bg-slate-900 text-white py-20 lg:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-6">
              <Layers className="w-3.5 h-3.5" /> INFRAESTRUCTURA 4.0 AUTOMATIZADA
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Hub Logístico Automatizado &<br />
              <span className="text-blue-400">Stock en Tiempo Real</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Disponibilidad inmediata para servidores empresariales, matrices NVMe y procesadores de alta densidad. Ruteo sistematizado con enlace directo al ERP corporativo.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl border-t border-slate-800 pt-8">
              <div>
                <span className="block text-2xl lg:text-3xl font-extrabold text-white">+150,000</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">SKUs Listos</span>
              </div>
              <div>
                <span className="block text-2xl lg:text-3xl font-extrabold text-white"> 15 min</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Packing Despacho</span>
              </div>
              <div>
                <span className="block text-2xl lg:text-3xl font-extrabold text-white">100%</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Trazabilidad SKU</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={ingresarAlPortal}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                {currentUser ? "Ir al Portal B2B" : "Ingresar al Portal B2B"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/catalogo"
                className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm transition"
              >
                Explorar Catálogo Activo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Estándar Operativo Mayorista */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              ESTÁNDAR OPERATIVO MAYORISTA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
              Infraestructura B2B Diseñada para<br />Escala Corporativa
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Optimizamos cada fase de adquisición técnica para garantizar continuidad operativa y abastecimiento crítico ininterrumpido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Cobertura Nacional",
              desc: "Despachos coordinados bajo estricto SLA de 24 horas a todas las capitales regionales y parques tecnológicos.",
              tag: "SLA 24H ACTIVO",
            },
            {
              title: "Stock Centralizado",
              desc: "+10,000 m² de almacenamiento climatizado y controlado para servidores, módulos de memoria y microprocesadores.",
              tag: "ALMACÉN HUB 4.2",
            },
            {
              title: "Facturación en Línea",
              desc: "Generación inmediata de comprobantes tributarios electrónicos (DTE), integración EDI y reportes fiscales automáticos.",
              tag: "SISTEMA DTE / MH",
            },
            {
              title: "Ejecutivo Dedicado",
              desc: "Asesoría técnica de ingeniería de preventa y líneas de financiamiento comercial asignadas para cuentas clave.",
              tag: "MESA TÉCNICA DIRECTA",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{feat.title}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{feat.desc}</p>
              <span className="inline-block text-[9px] font-bold tracking-widest text-blue-600 mt-4">
                {feat.tag} →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Módulos de Gestión Rápida */}
      <section className="bg-slate-50/70 border-y border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              SOLUCIONES CONECTADAS B2B
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
              Módulos de Gestión Rápida para Compradores TI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Herramientas integradas para agilizar la cotización masiva, consulta de disponibilidades en tiempo real y licitaciones institucionales.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Cotizador Express B2B</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Cargue su lista de partes en formato CSV/XLSX o ingrese los códigos de fabricante. Precios escalonados con cálculo de IVA al instante.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">✓ Carga masiva en segundos.</li>
                  <li className="flex items-center gap-2">✓ Reserva garantizada por 72 horas.</li>
                  <li className="flex items-center gap-2">✓ Descuentos escalonados por volumen.</li>
                </ul>
              </div>
              <Link
                href="/cotizador"
                className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-md shadow-blue-500/10 transition block"
              >
                Iniciar Cotización Rápida +
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Catálogo Directo de Fábrica</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Explore nuestro inventario certificado de microprocesadores de servidor, memorias ECC y matrices de almacenamiento NVMe.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">✓ Especificaciones técnicas oficiales.</li>
                  <li className="flex items-center gap-2">✓ Stock físico en Bodega Central visible.</li>
                  <li className="flex items-center gap-2">✓ Filtros de disponibilidad inmediata.</li>
                </ul>
              </div>
              <Link
                href="/catalogo"
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs text-center transition block"
              >
                Ver Catálogo de SKUs ↗
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Licitaciones & Compras Corp</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Mesa consultiva para pliegos de contratación pública y privada, emisión de cartas de distribuidor oficial y entregas calendarizadas.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">✓ Cartas de respaldo de fabricante.</li>
                  <li className="flex items-center gap-2">✓ Cotizaciones fijas hasta 90 días.</li>
                  <li className="flex items-center gap-2">✓ Asesoría de ingeniería preventa.</li>
                </ul>
              </div>
              <button
                onClick={openCheckout}
                className="mt-6 w-full py-2.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-xs transition cursor-pointer"
              >
                Cargar Pliego de Licitación 💾
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Marcas y Alianzas */}
      <section className="py-10 border-b border-slate-200 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
          <CheckCircle className="w-4 h-4 text-emerald-500" /> Alianzas Mayoristas Oficiales
        </span>
        <div className="flex flex-wrap gap-3">
          {["Intel Enterprise", "Kingston Tech", "Crucial Micron", "HP Enterprise", "Epson B2B"].map((brand) => (
            <span
              key={brand}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-bold"
            >
              • {brand}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

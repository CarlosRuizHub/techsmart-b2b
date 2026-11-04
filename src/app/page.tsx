"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  Lock,
  Mail,
  Building,
  PhoneCall,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useCart } from "@/src/lib/CartContext";
import { registrarUsuario, obtenerUsuarioPorCorreo } from "@/src/lib/firebaseService";

export default function LandingB2BPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openCheckout } = useCart();

  // Estados del Modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Abrir modal si la URL viene con ?auth=login de forma diferida
  useEffect(() => {
    if (searchParams.get("auth") === "login") {
      const frame = requestAnimationFrame(() => {
        setAuthTab("login");
        setIsAuthOpen(true);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [searchParams]);

  // Estados de Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Estados de Registro
  const [regEmpresa, setRegEmpresa] = useState("");
  const [regNit, setRegNit] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regEmail, setRegEmail] = useState("");

  // Manejo de Login
  const handleB2BLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);

    try {
      const user = await obtenerUsuarioPorCorreo(loginEmail);
      if (user) {
        localStorage.setItem("techsmart_active_user", JSON.stringify(user));
        setIsAuthOpen(false);
        router.push("/catalogo");
      } else {
        alert("No se encontró ningún cliente registrado con ese correo corporativo.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

 // Manejo de Registro 
  const handleB2BRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);

    try {
      await registrarUsuario({
        tipoCuenta: "empresarial",
        razonSocial: regEmpresa,
        nit: regNit,
        nombreContacto: regNombre,
        telefono: regTelefono,
        correo: regEmail,
        lineaCredito: 25000.0,
      });

      alert("¡Cuenta registrada con éxito! Ya puedes iniciar sesión con tus credenciales.");

      // Cambiar a la pestaña login y autocompletar el correo
      setAuthTab("login");
      setLoginEmail(regEmail);
      setLoginPass("");
      
      // Navegación interna optimizada de Next.js (elimina el error del linter)
      router.push("/?auth=login");
    } catch (error) {
      console.error("Error al registrar cliente:", error);
      alert("No se pudo completar el registro. Intenta nuevamente.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
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
                onClick={() => {
                  setAuthTab("login");
                  setIsAuthOpen(true);
                }}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                Ingresar al Portal B2B
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

      {/* 5. Modal de Autenticación (Login & Registro) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">Portal B2B Techsmart</h3>
                <p className="text-xs text-slate-500">Acceda a su cuenta o cree una nueva</p>
              </div>
              <button
                onClick={() => setIsAuthOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-100 text-xs mt-4">
              <button
                onClick={() => setAuthTab("login")}
                className={`flex-1 py-2 font-bold transition border-b-2 cursor-pointer ${
                  authTab === "login"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Ingresar
              </button>
              <button
                onClick={() => setAuthTab("register")}
                className={`flex-1 py-2 font-bold transition border-b-2 cursor-pointer ${
                  authTab === "register"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Registrarse
              </button>
            </div>

            {authTab === "login" ? (
              <form onSubmit={handleB2BLogin} className="mt-4 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Correo Electrónico Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="usuario@tuempresa.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {isSubmittingAuth ? "Verificando..." : "Iniciar Sesión B2B"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleB2BRegister} className="mt-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Razón Social / Empresa:
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Soluciones Digitales S.A. de C.V."
                      value={regEmpresa}
                      onChange={(e) => setRegEmpresa(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      NIT / NRC:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0614-280392-102-1"
                      value={regNit}
                      onChange={(e) => setRegNit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Contacto Comercial:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Carlos Morales"
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Número de Celular / WhatsApp:
                  </label>
                  <div className="relative">
                    <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+503 7123-4567"
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Correo Electrónico Corporativo:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="compras@tuempresa.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {isSubmittingAuth ? "Creando cuenta..." : "Crear Cuenta B2B & Activar Cupo"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
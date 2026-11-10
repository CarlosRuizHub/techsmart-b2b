"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cpu,
  ShoppingCart,
  ChevronDown,
  LogOut,
  ShoppingBag,
  FileSpreadsheet,
  CheckCircle2,
  User,
  CreditCard,
  Phone,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/src/lib/CartContext";
import UserHistoryModal from "./UserHistoryModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    openAuthModal,
    logout,
    totalItemsCount,
    totalEstimado,
    lineaCreditoDisponible,
    openCheckoutModal,
  } = useCart();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<"compras" | "cotizaciones">("compras");

  // Estado para el indicador de confirmación de cierre de sesión
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const abrirCompras = () => {
    setHistoryTab("compras");
    setHistoryModalOpen(true);
    setDropdownOpen(false);
  };

  const abrirCotizaciones = () => {
    setHistoryTab("cotizaciones");
    setHistoryModalOpen(true);
    setDropdownOpen(false);
  };

  const handleAbrirOrden = () => {
    if (totalItemsCount === 0) {
      toast.info("Tu pedido está vacío", {
        description: "Agrega productos desde el catálogo para iniciar tu compra.",
      });
      return;
    }

    if (pathname !== "/catalogo") {
      router.push("/catalogo");
    }
    openCheckoutModal();
  };

  // Abre el modal de confirmación y cierra el menú flotante
  const handleSolicitarCierreSesion = () => {
    setDropdownOpen(false);
    setConfirmLogoutOpen(true);
  };

  // Ejecuta el cierre de sesión y notifica mediante Sonner Toast
  const handleConfirmarLogout = () => {
    setConfirmLogoutOpen(false);
    logout();
    toast.success("Sesión cerrada exitosamente", {
      description: "Has salido de tu cuenta Techsmart B2B. ¡Hasta pronto!",
      duration: 4000,
    });
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Enlaces */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-tight">
                    Techsmart
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    Tu mejor aliado B2B
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-lg transition ${
                    pathname === "/"
                      ? "bg-slate-100 text-blue-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  href="/catalogo"
                  className={`px-3 py-2 rounded-lg transition ${
                    pathname === "/catalogo"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Catálogo
                </Link>
                <Link
                  href="/cotizador"
                  className={`px-3 py-2 rounded-lg transition ${
                    pathname === "/cotizador"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Cotizador B2B
                </Link>
              </nav>
            </div>

            {/* Carrito y Perfil */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAbrirOrden}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 transition text-xs font-bold cursor-pointer"
                title="Ver orden y proceder al pago"
              >
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span>ORDEN</span>
                <span className="font-mono text-blue-900 font-extrabold">
                  ${totalEstimado.toFixed(2)}
                </span>
                {totalItemsCount > 0 && (
                  <span className="ml-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </button>

              {!currentUser ? (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Acceso B2B
                </button>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {currentUser.nombreContacto?.slice(0, 2).toUpperCase() || "CS"}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-800 leading-none">
                          {currentUser.nombreContacto || "Cliente"}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {currentUser.tipoCuenta === "personal" ? "Cuenta Personal" : "Corporativo"}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </button>

                  {/* MENÚ DESPLEGABLE */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-xs z-50 animate-in fade-in zoom-in-95">
                      <div className="border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-slate-900 text-sm">
                            {currentUser.nombreContacto || "Usuario Techsmart"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 ml-6">
                          DUI/NIT: {currentUser.nit || "01478965-7"}
                        </p>
                      </div>

                      <div className="py-2.5 flex items-center justify-between text-slate-600 border-b border-slate-100">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          Línea disponible:
                        </span>
                        <span className="font-bold text-emerald-600 font-mono">
                          ${lineaCreditoDisponible.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="py-2 text-slate-500 text-[11px] flex items-center gap-2 border-b border-slate-100">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{currentUser.telefono || "7447-0810"}</span>
                      </div>

                      <div className="py-2 space-y-1 border-b border-slate-100">
                        <button
                          type="button"
                          onClick={abrirCompras}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold transition text-left cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                          <span>Mis Compras / Pedidos</span>
                        </button>

                        <button
                          type="button"
                          onClick={abrirCotizaciones}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold transition text-left cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                          <span>Mis Cotizaciones</span>
                        </button>
                      </div>

                      {/* Botón Cerrar Sesión con confirmación */}
                      <button
                        type="button"
                        onClick={handleSolicitarCierreSesion}
                        className="w-full mt-2 flex items-center gap-2 px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN */}
      {confirmLogoutOpen && (
        <div
          onClick={() => setConfirmLogoutOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 my-auto animate-in fade-in zoom-in-95 text-center space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Confirmación de Salida
              </span>
              <button
                type="button"
                onClick={() => setConfirmLogoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 ml-0.5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                ¿Deseas cerrar tu sesión?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Saldrás de tu cuenta comercial de Techsmart B2B.
              </p>
            </div>

            {/* AVISO SI TIENE ÓRDENES PENDIENTES / PRODUCTOS EN EL PEDIDO */}
            {totalItemsCount > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[11px] uppercase tracking-wide text-amber-800">
                    Orden de compra en curso
                  </p>
                  <p className="text-[11px] text-amber-700 leading-snug">
                    Tienes <strong>{totalItemsCount} {totalItemsCount === 1 ? "ítem" : "ítems"}</strong> pendientes por un total de{" "}
                    <strong className="font-mono text-amber-900">${totalEstimado.toFixed(2)} USD</strong>. Al salir, los artículos del pedido se limpiarán de la sesión actual.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                No tienes compras pendientes en curso. Puedes salir con total tranquilidad.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmLogoutOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm shadow-rose-600/20 cursor-pointer"
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial integrado */}
      <UserHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        initialTab={historyTab}
      />
    </>
  );
}
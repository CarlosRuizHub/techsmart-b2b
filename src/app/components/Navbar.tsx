"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Layers,
  FileSpreadsheet,
  Home,
  ShoppingCart,
  PhoneCall,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Building2,
  CreditCard,
  User as UserIcon,
  Lock,
} from "lucide-react";
import { useCart } from "@/src/lib/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItemsCount, totalEstimado, openCheckout, currentUser, logout, openAuthModal } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "B2B";
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Enlaces: "Cotizador B2B" solo se lista si hay usuario activo
  const navLinks = [
    { label: "Inicio", href: "/", icon: Home },
    { label: "Catálogo", href: "/catalogo", icon: Layers },
    ...(currentUser
      ? [{ label: "Cotizador B2B", href: "/cotizador", icon: FileSpreadsheet }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Corporativo */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Stock en Bodega Central Validado
          </span>
          <span className="hidden md:inline-block text-slate-600">|</span>
          <span className="hidden md:inline-block text-slate-400">
            Despachos Same-Day El Salvador
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="https://wa.me/50370008888?text=Hola,%20solicito%20asistencia%20con%20una%20orden%20B2B"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition"
          >
            <PhoneCall className="w-3 h-3" />
            Asesor WhatsApp Directo
          </a>
        </div>
      </div>

      {/* Barra Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                Techsmart
              </span>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                WAREHOUSE & B2B SUPPLY
              </p>
            </div>
          </Link>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Extremo Derecho */}
          <div className="flex items-center space-x-3">
            {/* Botón Cotización */}
            {currentUser && (
              <button
                type="button"
                onClick={openCheckout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 active:scale-95 transition cursor-pointer"
                title="Abrir Cotización / Resumen"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[9px] uppercase font-bold text-blue-600 leading-none">
                    Cotización
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    ${totalEstimado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </button>
            )}

            {/* Perfil o Botón Acceso */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {getInitials(currentUser.nombreContacto || currentUser.razonSocial || "")}
                  </div>
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <div className="font-bold text-slate-800 flex items-center gap-1 max-w-[130px] truncate">
                      {currentUser.tipoCuenta === "personal"
                        ? currentUser.nombreContacto
                        : currentUser.razonSocial}
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                      {currentUser.tipoCuenta === "personal"
                        ? "Cuenta Personal"
                        : currentUser.nombreContacto}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Card */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-3 bg-slate-50 rounded-xl mb-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        {currentUser.tipoCuenta === "personal" ? (
                          <UserIcon className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {currentUser.tipoCuenta === "personal"
                            ? currentUser.nombreContacto
                            : currentUser.razonSocial}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {currentUser.tipoCuenta === "personal"
                          ? (currentUser.nit && currentUser.nit !== "Consumidor Final"
                              ? `DUI: ${currentUser.nit}`
                              : "Cliente Particular")
                          : `NIT: ${currentUser.nit}`}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/80 flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" /> Línea disponible:
                        </span>
                        <span className="font-bold text-emerald-600">
                          ${currentUser.lineaCredito?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || (currentUser.tipoCuenta === "personal" ? "3,500.00" : "25,000.00")}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-2 text-xs space-y-1 text-slate-600 border-b border-slate-100 pb-2 mb-1">
                      <p className="text-[11px] flex items-center gap-1.5">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{currentUser.nombreContacto}</span>
                      </p>
                      <p className="text-[11px] flex items-center gap-1.5">
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        <span>{currentUser.telefono}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso B2B</span>
              </button>
            )}

            {/* Menú Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {currentUser ? (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión ({currentUser.nombreContacto})
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acceso B2B</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
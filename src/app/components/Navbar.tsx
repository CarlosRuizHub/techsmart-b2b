"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  FileSpreadsheet,
  Layers,

  ShoppingCart,
  PhoneCall,
 
  CheckCircle2,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/src/lib/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItemsCount, totalEstimado,} = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const navLinks = [
    {
      label: "Catálogo Directo",
      href: "/",
      icon: Layers,
    },
    {
      label: "Cotizador B2B & Express",
      href: "/cotizador",
      icon: FileSpreadsheet,
    },
    {
      label: "Garantías y RMA",
      href: "/reclamos",
      icon: ShieldCheck,
      badge: "DOA 7d",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner Operativo B2B */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Stock en Bodega Central Validado
          </span>
          <span className="hidden md:inline-block text-slate-500">|</span>
          
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

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Techsmart
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Distribución Oficial El Salvador & C.A.
              </p>
            </div>
          </Link>


          {/* Navigation Links Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  {link.label}
                  {link.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isActive
                          ? "bg-blue-700 text-blue-100"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile & Cart Quick Link */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 transition"
              title="Ver Lista de Cotización activa"
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
                <div className="text-[10px] uppercase font-bold text-blue-600 leading-none">
                  Cotización
                </div>
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  ${totalEstimado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </Link>

            {/* Profile Avatar / Distributor Info */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs">
                CM
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  Distribuidora Tech
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" />
                </div>
                <div className="text-slate-600 text-[11px]">Ing. Geovanny Segoviano</div>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-2">
            <div className="px-2 pb-2">
              <input
                type="text"
                placeholder="Buscar por modelo, PN, SKU..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
              />
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

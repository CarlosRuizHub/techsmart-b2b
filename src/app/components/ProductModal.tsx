"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  Layers,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";
import { Producto } from "@/src/lib/types";
import { useCart } from "@/src/lib/CartContext";
import ProductImageGallery from "./ProductImageGallery";

interface ProductModalProps {
  producto: Producto | null;
  onClose: () => void;
}

export default function ProductModal({ producto, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [cantidad, setCantidad] = useState(1);

  if (!producto) return null;

  // Lista de imágenes con respaldo de la imagen principal
  const listaImagenes =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes
      : [producto.imagen];

  // Cálculo de precio según escalonamiento por volumen
  const obtenerPrecioCalculado = () => {
    if (!producto.precioVolumen || producto.precioVolumen.length === 0) {
      return producto.precio;
    }
    const escalaOrdenada = [...producto.precioVolumen].sort(
      (a, b) => b.minQty - a.minQty
    );
    const escalaAplicable = escalaOrdenada.find((t) => cantidad >= t.minQty);
    return escalaAplicable ? escalaAplicable.price : producto.precio;
  };

  const precioUnitarioVigente = obtenerPrecioCalculado();
  const totalCotizacion = precioUnitarioVigente * cantidad;

  const handleAgregarACotizacion = () => {
    addItem(producto, cantidad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          {/* Columna Izquierda: Galería con Carrusel y Zoom Lupa */}
          <div className="md:col-span-5 flex flex-col justify-start">
            <ProductImageGallery
              images={listaImagenes}
              productName={producto.nombre}
            />

            {/* Badges de Garantía y Disponibilidad */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                  {producto.garantiaMeses} Meses Garantía
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                  Bodega Central SV
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Especificaciones y Acción de Cotización */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Encabezado y Categoría */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  {producto.categoria}
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  SKU: {producto.sku}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {producto.nombre}
              </h2>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {producto.descripcionLarga || producto.descripcionCorta}
              </p>

              {/* Indicador de Disponibilidad */}
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {producto.stock} unidades en stock
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Despacho 24h
                </span>
              </div>

              {/* Tabla de Especificaciones Técnicas */}
              {producto.specs && producto.specs.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Ficha Técnica
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    {producto.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {spec.label}:
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Escalas de Precio Mayorista */}
              {producto.precioVolumen && producto.precioVolumen.length > 0 && (
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Precios Escalonados por Volumen B2B:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {producto.precioVolumen.map((tier, idx) => {
                      const isActiveTier =
                        precioUnitarioVigente === tier.price &&
                        cantidad >= tier.minQty;
                      return (
                        <div
                          key={idx}
                          className={`p-1.5 rounded-lg border text-[11px] transition ${
                            isActiveTier
                              ? "bg-blue-50 border-blue-300 font-bold text-blue-900"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          <div className="text-[9px] uppercase font-semibold text-slate-400">
                            {tier.minQty}+ uds
                          </div>
                          <div>${tier.price.toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Barra Inferior de Acción y Cotización */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Subtotal Estimado ({cantidad} {cantidad === 1 ? "ud" : "uds"}):
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    ${totalCotizacion.toFixed(2)}
                  </span>
                  {precioUnitarioVigente < producto.precio && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Ahorro aplicado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Selector de Cantidad */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-slate-800">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCantidad((prev) =>
                        Math.min(producto.stock || 99, prev + 1)
                      )
                    }
                    className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Botón Agregar a Cotización */}
                <button
                  type="button"
                  onClick={handleAgregarACotizacion}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Agregar a Cotización</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
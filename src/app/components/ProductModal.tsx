"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  Check,
  Truck,
  ShoppingCart,
} from "lucide-react";
import { Producto } from "@/src/lib/types";
import { useCart } from "@/src/lib/CartContext";

interface ProductModalProps {
  producto: Producto | null;
  onClose: () => void;
}

export default function ProductModal({ producto, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [notaInterna, setNotaInterna] = useState("");
  const [added, setAdded] = useState(false);

  if (!producto) return null;

  const basePrice = producto.precio ?? 0;
  let currentUnitPrice = basePrice;
  if (producto.precioVolumen && producto.precioVolumen.length > 0) {
    const sortedTiers = [...producto.precioVolumen].sort(
      (a, b) => b.minQty - a.minQty
    );
    const tier = sortedTiers.find((t) => cantidad >= t.minQty);
    if (tier) {
      currentUnitPrice = tier.price;
    }
  }

  const subtotalLinea = currentUnitPrice * cantidad;
  const imagenUrl = producto.imagen || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80";
  const stockCount = typeof producto.stock === "number" ? producto.stock : 24;

  const handleAddToCart = () => {
    addItem(producto, cantidad, notaInterna);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {producto.categoria || "Componentes"}
              </span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {producto.sku || "SKU-B2B"}
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {stockCount} unidades disponibles
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
              {producto.nombre || "Detalle del Producto"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Columna Izquierda: Imagen y Garantía */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div className="relative h-60 w-full bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-center">
              <Image
                src={imagenUrl}
                alt={producto.nombre || "Producto"}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>

            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Garantía Oficial Techsmart B2B</span>
              </div>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                {producto.garantiaMeses || 12} meses de respaldo directo. Incluye cambio express inmediato por falla DOA dentro de los primeros 7 días.
              </p>
              <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>{producto.bodega || "Bodega Central (San Salvador)"}</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Especificaciones y Precios por Volumen */}
          <div className="md:col-span-7 flex flex-col justify-between">
            {/* Especificaciones Técnicas */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Especificaciones del Componente
              </h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs overflow-hidden">
                {producto.specs && producto.specs.length > 0 ? (
                  producto.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-5 p-2 px-3 hover:bg-slate-50 transition"
                    >
                      <span className="col-span-2 font-medium text-slate-500">
                        {spec.label}:
                      </span>
                      <span className="col-span-3 font-semibold text-slate-800">
                        {spec.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-500 text-xs">
                    {producto.descripcionLarga || producto.descripcionCorta || "Componente original para distribución mayorista."}
                  </div>
                )}
              </div>

              {/* Escala de Precios B2B por Volumen */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Precios Escalonados B2B
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {producto.precioVolumen && producto.precioVolumen.length > 0 ? (
                    producto.precioVolumen.map((tier, idx) => {
                      const isSelected =
                        cantidad >= tier.minQty &&
                        (idx === producto.precioVolumen!.length - 1 ||
                          cantidad < producto.precioVolumen![idx + 1].minQty);
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-center transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                              : "border-slate-200 bg-slate-50/50"
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 block">
                            {tier.minQty}+ Unidades
                          </span>
                          <span className="text-sm font-bold text-slate-900 block mt-0.5">
                            ${tier.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold block">
                            {tier.discountLabel}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center">
                      Precio B2B: <strong className="text-slate-900">${basePrice.toFixed(2)}</strong> (Consulte con su ejecutivo por volumen adicional)
                    </div>
                  )}
                </div>
              </div>

              {/* Nota o Referencia interna */}
              <div className="mt-3">
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Nota o referencia interna para esta partida (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Para ensamble Licitación Ministerio, Proyecto Alpha..."
                  value={notaInterna}
                  onChange={(e) => setNotaInterna(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              {/* Stepper Cantidad */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Cantidad:</span>
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200 rounded-l-lg transition"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-slate-900 min-w-8 text-center bg-white border-x border-slate-200">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidad(cantidad + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200 rounded-r-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Subtotal & Add Button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Subtotal estimado:</span>
                  <span className="text-base font-bold text-blue-700">
                    ${subtotalLinea.toFixed(2)} USD
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                    added
                      ? "bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 active:scale-95"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Agregado a Cotización</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Agregar a Cotización</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Eye, Check } from "lucide-react";
import { Producto } from "@/src/lib/types";
import { useCart } from "@/src/lib/CartContext";

interface ProductCardProps {
  producto: Producto;
  onOpenModal: (producto: Producto) => void;
}

export default function ProductCard({ producto, onOpenModal }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(producto, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const volumeTier = producto.precioVolumen && producto.precioVolumen.length > 1
    ? producto.precioVolumen[producto.precioVolumen.length - 1]
    : null;

  const stockCount = typeof producto.stock === "number" ? producto.stock : 24;
  const imagenUrl = producto.imagen || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80";

  return (
    <div
      onClick={() => onOpenModal(producto)}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top badges */}
      <div className="p-3.5 pb-0 flex items-center justify-between text-[11px] gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${
            stockCount > 10
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {stockCount > 10
            ? `EN STOCK (${stockCount}+)`
            : `POCAS UNIDADES (${stockCount})`}
        </span>
        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
          {producto.sku || "SKU-B2B"}
        </span>
      </div>

      {/* Product Image */}
      <div className="relative h-44 w-full p-4 flex items-center justify-center bg-white group-hover:scale-[1.02] transition-transform duration-200">
        <Image
          src={imagenUrl}
          alt={producto.nombre || "Producto"}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Quick view floating hint */}
        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Vista Rápida
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 pt-1 flex-1 flex flex-col justify-between border-t border-slate-100">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-1">
            {producto.categoria || "Componentes & Hardware"}
          </div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {producto.nombre || "Producto Techsmart B2B"}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {producto.descripcionCorta || "Componente original para integradores con garantía de fábrica y cambio express."}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-slate-600 block">Precio B2B:</span>
              <span className="text-lg font-bold text-slate-900">
                ${(producto.precio ?? 0).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-600 ml-1">+ IVA</span>
            </div>

            {volumeTier && (
              <div className="text-right">
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  Volumen ({volumeTier.minQty}+ uds):
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  ${volumeTier.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-3.5 grid grid-cols-5 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(producto);
              }}
              className="col-span-2 py-2 px-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              Detalles
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className={`col-span-3 py-2 px-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm ${
                added
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.98]"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>¡Agregado!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>+ Cotizar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

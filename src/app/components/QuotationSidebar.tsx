"use client";

import React from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Printer,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/src/lib/CartContext";

export default function QuotationSidebar() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItemsCount,
    subtotalNeto,
    descuentoTotal,
    ivaEstimado,
    totalEstimado,
    openCheckoutModal,
  } = useCart();

  const handlePrintProforma = () => {
    if (items.length === 0) {
      toast.warning("Lista vacía", {
        description: "Agrega al menos un ítem a la lista para generar la proforma.",
      });
      return;
    }
    window.print();
  };

  const handleFinalizarCompra = () => {
    if (items.length === 0) {
      toast.warning("Lista vacía", {
        description: "Agrega al menos un producto antes de proceder al pago.",
      });
      return;
    }
    openCheckoutModal();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Lista de Cotización
            </h3>
            <span className="text-[11px] text-slate-500">
              {totalItemsCount} {totalItemsCount === 1 ? "ítem" : "ítems"} seleccionados
            </span>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-[11px] text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
            title="Vaciar lista"
          >
            <Trash2 className="w-3 h-3" />
            Vaciar
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="mt-3 divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              La lista de cotización está vacía
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Haz clic en &ldquo;+ Cotizar&rdquo; en cualquiera de los productos del catálogo.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.producto.id} className="py-3 flex items-start gap-2.5">
              {/* Thumbnail */}
              <div className="relative w-11 h-11 bg-slate-50 border border-slate-200 rounded-lg shrink-0 p-1">
                <Image
                  src={item.producto.imagen}
                  alt={item.producto.nombre}
                  fill
                  className="object-contain p-0.5"
                />
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-800 truncate">
                  {item.producto.nombre}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.producto.sku}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700">
                    ${item.precioUnitario.toFixed(2)} c/u
                  </span>
                </div>

                {/* Quantity stepper & subtotal */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-slate-200 rounded bg-slate-50 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.producto.id, item.cantidad - 1)
                      }
                      className="px-2 py-0.5 text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 font-bold text-slate-800 bg-white border-x border-slate-200 text-[11px]">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.producto.id, item.cantidad + 1)
                      }
                      className="px-2 py-0.5 text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      ${(item.precioUnitario * item.cantidad).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.producto.id)}
                      className="text-slate-300 hover:text-rose-500 transition p-0.5 cursor-pointer"
                      title="Eliminar partida"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary calculation */}
      {items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal Neto:</span>
            <span className="font-semibold text-slate-700">
              ${subtotalNeto.toFixed(2)} USD
            </span>
          </div>

          {descuentoTotal > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Descuento B2B Mayorista:</span>
              <span>-${descuentoTotal.toFixed(2)} USD</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500">
            <span>IVA Estimado (13%):</span>
            <span className="font-semibold text-slate-700">
              ${ivaEstimado.toFixed(2)} USD
            </span>
          </div>

          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Estimado:</span>
            <span className="text-base text-blue-700">
              ${totalEstimado.toFixed(2)} USD
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 space-y-2">
            <button
              type="button"
              onClick={handleFinalizarCompra}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition duration-200 cursor-pointer"
            >
              <span>Finalizar Orden y Pagar</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrintProforma}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir Proforma Borrador</span>
            </button>
          </div>

          {/* Guarantee tip */}
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Incluye garantía directa y despacho express disponible en Bodega Central.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
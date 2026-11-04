"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  FileCheck,
  Building2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/src/lib/CartContext";
import { guardarCotizacion } from "@/src/lib/firebaseService";
import { Cotizacion } from "@/src/lib/types";

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    closeCheckout,
    items,
    removeItem,
    clearCart,
    subtotalNeto,
    descuentoTotal,
    ivaEstimado,
    totalEstimado,
    lineaCreditoDisponible,
  } = useCart();

  const [metodo, setMetodo] = useState<"credito_b2b" | "cotizacion" | "transferencia">("credito_b2b");
  const [razonSocial, setRazonSocial] = useState("Distribuidora Tech El Salvador S.A. de C.V.");
  const [nit, setNit] = useState("0614-280392-102-1");
  const [contacto, setContacto] = useState("Ing. Carlos Morales");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [folioGenerado, setFolioGenerado] = useState("");

  if (!isCheckoutOpen) return null;

  const handleProcesar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      const folio = `B2B-${Math.floor(1000 + Math.random() * 9000)}`;
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const nuevaCotizacion: Omit<Cotizacion, "id"> = {
        folio,
        fecha: fechaStr,
        vencimiento: "Vigencia 8 días",
        estado: metodo === "credito_b2b" ? "Aprobada" : "En Revisión",
        tipoCliente: "Empresa / Corporativo",
        razonSocial,
        nit,
        contacto,
        telefono: "+503 7123-4567",
        correo: "distribuidoratech@sv.com",
        tiempoEntrega: "Inmediato (24h)",
        validezDias: 8,
        items: [...items],
        subtotalNeto,
        descuento: descuentoTotal,
        iva: ivaEstimado,
        total: totalEstimado,
        notas: `Método de procesamiento: ${metodo.toUpperCase()}`,
      };

      await guardarCotizacion(nuevaCotizacion);
      setFolioGenerado(folio);
      setCompletado(true);
      clearCart();
    } catch (err) {
      console.error("Error al procesar orden:", err);
      alert("Ocurrió un error al registrar la transacción.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {completado ? "¡Operación Registrada!" : "Finalizar Cotización / Orden"}
            </h3>
            <p className="text-xs text-slate-500">Distribución Mayorista El Salvador</p>
          </div>
          <button
            onClick={() => {
              setCompletado(false);
              closeCheckout();
            }}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completado ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">
              Proforma/Orden registrada con Folio: <span className="font-mono text-blue-600">{folioGenerado}</span>
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              El pedido ha ingresado exitosamente a la cola de despacho de Bodega Central.
            </p>
            <button
              onClick={() => {
                setCompletado(false);
                closeCheckout();
              }}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              Aceptar y Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleProcesar} className="mt-4 space-y-4">
            {/* Lista breve de ítems */}
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              {items.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400">No hay productos en la lista</p>
              ) : (
                items.map((item) => (
                  <div key={item.producto.id} className="py-2 px-1 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{item.producto.nombre}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.cantidad} x ${item.precioUnitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        ${(item.cantidad * item.precioUnitario).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.producto.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Opciones de Pago / Emisión */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Modalidad de Operación:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMetodo("credito_b2b")}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    metodo === "credito_b2b"
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="font-bold text-[11px]">Línea de Crédito</span>
                  <span className="text-[9px] text-slate-500">Saldo: ${lineaCreditoDisponible.toLocaleString()}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodo("cotizacion")}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    metodo === "cotizacion"
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="font-bold text-[11px]">Proforma Formal</span>
                  <span className="text-[9px] text-slate-500">Válida por 8 días</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodo("transferencia")}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    metodo === "transferencia"
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="font-bold text-[11px]">Transferencia / CCF</span>
                  <span className="text-[9px] text-slate-500">Contra Factura</span>
                </button>
              </div>
            </div>

            {/* Datos Fiscales Rápidos */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Razón Social</label>
                <input
                  type="text"
                  required
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">NIT / NRC</label>
                <input
                  type="text"
                  required
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            {/* Desglose Económico */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Neto:</span>
                <span>${subtotalNeto.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>IVA Trasladado (13%):</span>
                <span>${ivaEstimado.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1.5 border-t border-slate-800 text-sm">
                <span>Total Operación:</span>
                <span className="text-emerald-400">${totalEstimado.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isProcessing || items.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition"
            >
              {isProcessing
                ? "Procesando..."
                : metodo === "credito_b2b"
                ? "Confirmar Cargo a Línea de Crédito"
                : "Generar y Registrar Proforma Oficial"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
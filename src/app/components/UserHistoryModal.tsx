"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ShoppingBag,
  FileSpreadsheet,
  Calendar,
  CreditCard,
  Building2,
  Truck,
  Package,
  Copy,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/src/lib/CartContext";
import { getOrdenesCompra, getCotizaciones } from "@/src/lib/firebaseService";
import { OrdenCompra, Cotizacion } from "@/src/lib/types";

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "compras" | "cotizaciones";
}

// Tipo auxiliar para admitir posibles campos de contacto sin violar las reglas de TypeScript ni usar 'any'
type CotizacionConContacto = Cotizacion & {
  nombreContacto?: string;
  cliente?: {
    nombreContacto?: string;
    razonSocial?: string;
  };
};

export default function UserHistoryModal({
  isOpen,
  onClose,
  initialTab = "compras",
}: UserHistoryModalProps) {
  const { currentUser } = useCart();
  const [activeTab, setActiveTab] = useState<"compras" | "cotizaciones">(initialTab);
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Sincronización de props a estado durante la fase de render (patrón recomendado por React para evitar re-renders en cascada)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setLoading(true);
      setActiveTab(initialTab);
    }
  } else if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Carga de datos asíncrona al abrir el modal (únicamente actualiza estado al resolver)
  useEffect(() => {
    if (!isOpen) return;

    let cancelado = false;

    async function fetchData() {
      try {
        const [ordenesData, cotizacionesData] = await Promise.all([
          getOrdenesCompra(),
          getCotizaciones(),
        ]);

        if (!cancelado) {
          setOrdenes(ordenesData);
          setCotizaciones(cotizacionesData);
        }
      } catch (error) {
        console.error("Error al cargar historial del usuario:", error);
        toast.error("Error de sincronización", {
          description: "No se pudo obtener el historial completo desde Firestore.",
        });
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelado = true;
    };
  }, [isOpen]);

  const copiarFolio = (folio: string) => {
    navigator.clipboard.writeText(folio);
    toast.success("Folio copiado", {
      description: `Código ${folio} guardado en el portapapeles.`,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-5 sm:p-6 my-auto animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col"
      >
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Package className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Historial de Operaciones & Cuenta
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cliente: <strong className="text-slate-700">{currentUser?.nombreContacto || currentUser?.correo}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de pestañas */}
        <div className="flex border-b border-slate-200 mt-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("compras")}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "compras"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mis Compras / Órdenes</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "compras" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {ordenes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cotizaciones")}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "cotizaciones"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Mis Cotizaciones Guardadas</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "cotizaciones" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {cotizaciones.length}
            </span>
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="mt-4 overflow-y-auto pr-1 flex-1 space-y-3">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-slate-500">Cargando registros desde Firestore...</p>
            </div>
          ) : activeTab === "compras" ? (
            /* LISTA DE COMPRAS */
            ordenes.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Sin compras registradas</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Aún no has finalizado órdenes de compra con tarjeta o línea de crédito.
                </p>
              </div>
            ) : (
              ordenes.map((orden) => (
                <div
                  key={orden.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {orden.folio}
                      </span>
                      <button
                        type="button"
                        onClick={() => copiarFolio(orden.folio)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded transition cursor-pointer"
                        title="Copiar folio"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {orden.fecha}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmada
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        ${orden.total.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Resumen de pago y despacho */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      {orden.metodoPago === "tarjeta" ? (
                        <>
                          <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-slate-700">
                            Tarjeta ({orden.detallePago.marcaTarjeta || "Bancaria"} ••••{" "}
                            {orden.detallePago.ultimosCuatroDigitos || "0000"})
                          </span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-slate-700">Línea de Crédito Mayorista</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">
                        <strong>{orden.envio.departamento}:</strong> {orden.envio.direccionExacta}
                      </span>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Partidas del pedido ({orden.items.length}):
                    </span>
                    <div className="space-y-1">
                      {orden.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700">
                          <span className="line-clamp-1">
                            • {it.cantidad}x {it.producto.nombre}
                          </span>
                          <span className="font-mono text-slate-500 shrink-0 ml-2">
                            ${(it.precioUnitario * it.cantidad).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            /* LISTA DE COTIZACIONES */
            cotizaciones.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <FileSpreadsheet className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Sin cotizaciones registradas</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Aún no has guardado proformas desde el módulo Cotizador B2B.
                </p>
              </div>
            ) : (
              cotizaciones.map((cot, idx) => {
                const cotItem = cot as CotizacionConContacto;
                const nombreContacto =
                  cotItem.nombreContacto ||
                  cotItem.cliente?.nombreContacto ||
                  currentUser?.nombreContacto ||
                  "Cliente Registrado";

                return (
                  <div
                    key={cot.id || idx}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {cot.id ? `PRO-${cot.id.slice(0, 8).toUpperCase()}` : `COT-#${idx + 1}`}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cot.fecha || "Reciente"}
                        </span>
                      </div>

                      <span className="text-sm font-bold text-slate-900 font-mono">
                        ${(cot.total || 0).toFixed(2)} USD
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        <strong>Contacto:</strong> {nombreContacto} •{" "}
                        {cot.correo || currentUser?.correo || "Sin correo"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Total partidas: <strong>{cot.items?.length || 0} ítems</strong> (IVA desglosado incluido).
                      </p>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { Sparkles, MapPin } from "lucide-react";
import { CartItem } from "@/src/lib/types";

interface ProformaPrintViewProps {
  folio?: string;
  cliente: {
    razonSocial: string;
    nit: string;
    nombreContacto: string;
    telefono: string;
    correo: string;
    tipoCliente?: string;
  };
  items: CartItem[];
  subtotal: number;
  iva: number;
  total: number;
  tiempoEntrega: string;
  validezDias: number;
  notas?: string;
}

export default function ProformaPrintView({
  folio = "COT-PROFORMA",
  cliente,
  items,
  subtotal,
  iva,
  total,
  tiempoEntrega,
  validezDias,
  notas,
}: ProformaPrintViewProps) {
  const fechaHoy = new Date().toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    /* CAMBIO CLAVE: 'hidden print:block' oculta la proforma en pantalla 
       y la muestra exclusivamente al pulsar imprimir o generar PDF */
    <div className="hidden print:block text-slate-900 bg-white w-full max-w-4xl mx-auto p-4 text-[11px] leading-tight font-sans">
      {/* 1. ENCABEZADO CORPORATIVO */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-950">
              Techsmart B2B
            </h1>
            <p className="text-[10px] font-bold text-blue-700 tracking-wider uppercase">
              Distribuidora & Mayorista de Tecnología S.A. de C.V.
            </p>
            <div className="text-[9px] text-slate-500 space-y-0.5 mt-1">
              <p className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Bodega Central: Parque Industrial Las Mercedes, San Salvador
              </p>
              <p className="flex items-center gap-2">
                <span><strong>NIT:</strong> 0614-280392-102-1</span>
                <span>•</span>
                <span><strong>NRC:</strong> 294810-3</span>
                <span>•</span>
                <span><strong>PBX:</strong> +503 2200-8800</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Folio y Fecha */}
        <div className="text-right border border-slate-200 rounded-xl p-2.5 bg-slate-50 min-w-[190px]">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 block">
            Cotización Proforma
          </span>
          <span className="text-base font-black text-slate-900 font-mono block">
            {folio}
          </span>
          <div className="mt-1 pt-1 border-t border-slate-200 text-[9px] text-slate-600 space-y-0.5">
            <p><strong>Fecha Emisión:</strong> {fechaHoy}</p>
            <p><strong>Validez de Oferta:</strong> {validezDias} días calendario</p>
          </div>
        </div>
      </div>

      {/* 2. DATOS DEL CLIENTE / RECEPTOR */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/70">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-1">
            Datos Fiscales del Cliente
          </span>
          <p className="text-xs font-bold text-slate-900 truncate">
            {cliente.razonSocial || "Consumidor Final"}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            <strong>NIT / DUI:</strong> {cliente.nit || "N/D"}
          </p>
          <p className="text-[10px] text-slate-600">
            <strong>Modalidad:</strong> {cliente.tipoCliente || "Cliente B2B Registrado"}
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/70">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-1">
            Contacto y Logística
          </span>
          <p className="text-xs font-bold text-slate-900 truncate">
            {cliente.nombreContacto || "Atención al Cliente"}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            <strong>Teléfono / WhatsApp:</strong> {cliente.telefono || "N/D"}
          </p>
          <p className="text-[10px] text-slate-600">
            <strong>Tiempo de Entrega:</strong> {tiempoEntrega || "Inmediato (24h)"}
          </p>
        </div>
      </div>

      {/* 3. TABLA DE PARTIDAS Y COMPONENTES */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-wider">
              <th className="py-2 px-3 text-center w-8">#</th>
              <th className="py-2 px-3">Descripción Técnica & SKU</th>
              <th className="py-2 px-3 text-center">Garantía</th>
              <th className="py-2 px-3 text-center w-12">Cant.</th>
              <th className="py-2 px-3 text-right w-24">Precio Unit.</th>
              <th className="py-2 px-3 text-right w-24">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[10px]">
            {items.map((it, idx) => {
              const subtotalItem = it.cantidad * it.precioUnitario;
              return (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                  <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <span className="font-bold text-slate-900 block leading-tight">
                      {it.producto.nombre}
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">
                      SKU: {it.producto.sku} • {it.producto.categoria}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-medium text-slate-600 whitespace-nowrap">
                    {it.producto.garantiaMeses} Meses
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-slate-900">
                    {it.cantidad}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    ${it.precioUnitario.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    ${subtotalItem.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. TOTALES Y CONDICIONES COMERCIALES */}
      <div className="grid grid-cols-12 gap-3 items-start">
        <div className="col-span-7 border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-[9px] text-slate-600 space-y-1.5">
          <p className="font-bold text-slate-900 uppercase tracking-wider text-[9px]">
            Condiciones de Venta & Garantía B2B:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
            <li>Precios expresados en Dólares de los Estados Unidos (USD).</li>
            <li>Garantía oficial directa en Bodega Central San Salvador con cambio express DOA (7 días).</li>
            <li>Entrega en sucursal o despacho a domicilio con ruta validada en El Salvador.</li>
          </ul>
          <div className="pt-1 border-t border-slate-200 text-slate-700">
            <strong>Cuentas para Transferencias Directas:</strong>
            <p>Banco Agrícola: #00300-19283-01 (Cta. Corriente)</p>
            <p>BAC Credomatic: #201982731 (Cta. Corriente)</p>
          </div>
          {notas && (
            <p className="italic text-slate-500 pt-1 border-t border-slate-200">
              <strong>Nota del Solicitante:</strong> {notas}
            </p>
          )}
        </div>

        <div className="col-span-5 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 p-2 border-b border-slate-200">
            <span className="text-[9px] font-bold uppercase text-slate-600 tracking-wider">
              Liquidación Proforma
            </span>
          </div>
          <div className="p-2.5 space-y-1.5 text-[10px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Neto:</span>
              <span className="font-mono font-semibold">
                ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA Trasladado (13%):</span>
              <span className="font-mono font-semibold">
                ${iva.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-black text-slate-900">Total Proforma:</span>
              <span className="font-black text-blue-700 font-mono text-sm">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FIRMA Y PIE DE PÁGINA */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-end text-[9px] text-slate-500">
        <div>
          <p className="font-bold text-slate-700">Techsmart B2B Wholesale System</p>
          <p>Documento proforma emitido electrónicamente sin tachaduras ni enmendaduras.</p>
        </div>
        <div className="text-center min-w-[160px] border-t border-slate-400 pt-1">
          <p className="font-bold text-slate-800">Firma / Sello Despacho B2B</p>
          <p className="text-[8px] text-slate-400">Departamento de Operaciones</p>
        </div>
      </div>
    </div>
  );
}
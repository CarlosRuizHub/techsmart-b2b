"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Building,
  User,
  Phone,
  Mail,
  UploadCloud,
  CheckCircle,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  Eye,
  Layers,
} from "lucide-react";
import { useCart } from "@/src/lib/CartContext";
import { Cotizacion } from "@/src/lib/types";
import {
  getCotizaciones,
  guardarCotizacion,
  subirArchivoAdjunto,
} from "@/src/lib/firebaseService";
import { SAMPLE_PRODUCTOS } from "@/src/lib/sampleData";

type TipoCliente = "Empresa / Corporativo" | "Cliente Particular";
type TiempoEntrega = "Inmediato (24h)" | "24 - 72 hrs" | "Bajo Pedido (7-15d)";

// Campos del formulario que el cliente puede editar sobre los datos de su perfil
interface Ediciones {
  tipoCliente?: TipoCliente;
  razonSocial?: string;
  nit?: string;
  contacto?: string;
  telefono?: string;
  correo?: string;
}

export default function CotizadorPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    addItem,
    clearCart,
    subtotalNeto,
    descuentoTotal,
    ivaEstimado,
    totalEstimado,
    lineaCreditoDisponible,
    currentUser,    
    openAuthModal,
  } = useCart();

  // Datos fiscales y de contacto: se precargan desde el perfil del cliente con sesión iniciada.
  // Lo que el cliente edite en el formulario tiene prioridad sobre el perfil, y las
  // ediciones se descartan si cambia la cuenta con sesión.
  const [edicionesDe, setEdicionesDe] = useState<{
    correo: string | null;
    valores: Ediciones;
  }>({ correo: null, valores: {} });
  const ediciones: Ediciones =
    edicionesDe.correo === (currentUser?.correo ?? null) ? edicionesDe.valores : {};
  const editar = (cambio: Ediciones) =>
    setEdicionesDe({
      correo: currentUser?.correo ?? null,
      valores: { ...ediciones, ...cambio },
    });

  const tipoCliente: TipoCliente =
    ediciones.tipoCliente ??
    (currentUser?.tipoCuenta === "personal" ? "Cliente Particular" : "Empresa / Corporativo");
  const razonSocial = ediciones.razonSocial ?? currentUser?.razonSocial ?? "";
  const nit = ediciones.nit ?? currentUser?.nit ?? "";
  const contacto = ediciones.contacto ?? currentUser?.nombreContacto ?? "";
  const telefono = ediciones.telefono ?? currentUser?.telefono ?? "";
  const correo = ediciones.correo ?? currentUser?.correo ?? "";

  const setTipoCliente = (v: TipoCliente) => editar({ tipoCliente: v });
  const setRazonSocial = (v: string) => editar({ razonSocial: v });
  const setNit = (v: string) => editar({ nit: v });
  const setContacto = (v: string) => editar({ contacto: v });
  const setTelefono = (v: string) => editar({ telefono: v });
  const setCorreo = (v: string) => editar({ correo: v });

  // Resto del formulario
  const [tiempoEntrega, setTiempoEntrega] = useState<TiempoEntrega>("Inmediato (24h)");
  const [validezDias, setValidezDias] = useState<number>(8);
  const [notas, setNotas] = useState("");
  const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);

  // Cotizaciones del cliente con sesión. Se guarda a quién pertenece la lista para no
  // mostrar nunca las cotizaciones de otra cuenta mientras se cargan las nuevas.
  const [cotizacionesData, setCotizacionesData] = useState<{
    correo: string;
    lista: Cotizacion[];
  } | null>(null);
  const cotizacionesList: Cotizacion[] =
    cotizacionesData && cotizacionesData.correo === currentUser?.correo
      ? cotizacionesData.lista
      : [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successFolio, setSuccessFolio] = useState<string | null>(null);
  const [selectedCotizacionModal, setSelectedCotizacionModal] = useState<Cotizacion | null>(null);

  // Cargar las cotizaciones del cliente cuando hay sesión (y al cambiar de cuenta)
  const correoSesion = currentUser?.correo;
  useEffect(() => {
    if (!correoSesion) return;
    let cancelado = false;

    async function fetchQuotes() {
      const data = await getCotizaciones();
      if (!cancelado) {
        setCotizacionesData({ correo: correoSesion as string, lista: data });
      }
    }
    fetchQuotes();

    return () => {
      cancelado = true;
    };
  }, [correoSesion]);

  // Quick preset template handler
  const handleApplyPreset = (presetName: string) => {
    if (presetName === "PC Gamer / Ensambles") {
      addItem(SAMPLE_PRODUCTOS[0], 2); // SSD Kingston
      addItem(SAMPLE_PRODUCTOS[1], 2); // RAM Fury Beast
      addItem(SAMPLE_PRODUCTOS[3], 1); // ASUS TUF B650
      addItem(SAMPLE_PRODUCTOS[4], 1); // Intel i7-14700K
      addItem(SAMPLE_PRODUCTOS[5], 1); // PSU Corsair
    } else if (presetName === "Servidores & Redes") {
      addItem(SAMPLE_PRODUCTOS[6], 2); // Mikrotik CRS326
      addItem(SAMPLE_PRODUCTOS[0], 4); // SSD Kingston
      addItem(SAMPLE_PRODUCTOS[5], 2); // Corsair 750W
    } else if (presetName === "Oficina & Corporativo") {
      addItem(SAMPLE_PRODUCTOS[2], 5); // Tinta Epson Pack
      addItem(SAMPLE_PRODUCTOS[7], 5); // Windows 11 Pro OEM
      addItem(SAMPLE_PRODUCTOS[0], 5); // SSD Kingston 1TB
    }
  };

  const handleSubmitCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      openAuthModal();
      return;
    }

    if (items.length === 0) {
      alert("Por favor agrega al menos un ítem a la cotización desde el catálogo o plantillas rápidas.");
      return;
    }

    setIsSubmitting(true);
    try {
      let archivoUrl = "";
      if (archivoAdjunto) {
        archivoUrl = await subirArchivoAdjunto(archivoAdjunto, "rfq");
      }

      const randomFolio = `COT-${Math.floor(1000 + Math.random() * 9000)}`;
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const fechaVenc = new Date(hoy.getTime() + validezDias * 24 * 60 * 60 * 1000);
      const vencStr = `${fechaVenc.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} (en ${validezDias} días)`;

      const nuevaCot: Omit<Cotizacion, "id"> = {
        folio: randomFolio,
        fecha: fechaStr,
        vencimiento: vencStr,
        estado: "En Revisión",
        tipoCliente,
        razonSocial,
        nit,
        contacto,
        telefono,
        correo,
        tiempoEntrega,
        validezDias,
        items: [...items],
        subtotalNeto,
        descuento: descuentoTotal,
        iva: ivaEstimado,
        total: totalEstimado,
        notas,
        archivoAdjuntoUrl: archivoUrl,
      };

      const saved = await guardarCotizacion(nuevaCot);
      setCotizacionesData({
        correo: currentUser.correo,
        lista: [saved, ...cotizacionesList],
      });
      setSuccessFolio(randomFolio);
      clearCart();
    } catch (err) {
      console.error("Error guardando cotización:", err);
      alert(
        err instanceof Error && err.message.startsWith("Debes iniciar sesión")
          ? err.message
          : "Hubo un error al procesar la cotización."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };


  if (!currentUser) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Módulo Exclusivo para Clientes B2B
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Para generar cotizaciones, debe iniciar sesión con su cuenta corporativa o personal.
        </p>
        <button
          type="button"
          onClick={openAuthModal}
          className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
        >
          Iniciar Sesión / Registrar Empresa o usuario
        </button>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Top Breadcrumb & Status */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="text-slate-500 hover:text-blue-600 transition">
              Techsmart B2B
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-blue-700">Cotizador B2B & Express e-Engine</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              REF-B2B-128
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">
              Línea de Crédito Disponible:{" "}
              <strong className="text-slate-800">
                ${lineaCreditoDisponible.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </strong>
            </span>
            <Link
              href="/"
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              Ver Catálogo Completo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Column (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
              {/* Header Title */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Nueva Solicitud de Cotización B2B
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Complete los datos fiscales y configure las partidas para generar la proforma oficial con IVA desglosado.
                  </p>
                </div>

                {/* Tipo de Cliente Toggle */}
                <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={() => setTipoCliente("Empresa / Corporativo")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition ${
                      tipoCliente === "Empresa / Corporativo"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Empresa / Corporativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoCliente("Cliente Particular")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition ${
                      tipoCliente === "Cliente Particular"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Cliente Particular
                  </button>
                </div>
              </div>

              {/* Success Notification */}
              {successFolio && (
                <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">
                        ¡Cotización Generada Exitosamente! Folio: {successFolio}
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        La proforma ha sido registrada en el sistema Techsmart y enviada a revisión técnica. Puede descargarla en PDF o imprimirla a continuación.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccessFolio(null)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Nueva Cotización
                  </button>
                </div>
              )}

              {/* Fast Presets */}
              <div className="mt-5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Plantillas Rápidas para Ensambles o Proyectos:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "PC Gamer / Ensambles",
                    "Servidores & Redes",
                    "Oficina & Corporativo",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>{preset}</span>
                    </button>
                  ))}
                  <Link
                    href="/"
                    className="px-3 py-1 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Añadir ítems desde Catálogo</span>
                  </Link>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitCotizacion} className="mt-6 space-y-6">
                {/* Fiscal & Contact Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Razón Social / Nombre Comercial:
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={razonSocial}
                        onChange={(e) => setRazonSocial(e.target.value)}
                        placeholder="Ej. Distribuidora Tech El Salvador S.A. de C.V."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      NIT / NRC (Registro Fiscal):
                    </label>
                    <input
                      type="text"
                      required
                      value={nit}
                      onChange={(e) => setNit(e.target.value)}
                      placeholder="0614-280392-102-1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nombre del Contacto / Solicitante:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={contacto}
                        onChange={(e) => setContacto(e.target.value)}
                        placeholder="Ing. Carlos Morales"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Teléfono Directo / WhatsApp:
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+503 7123-4567"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Correo Electrónico para envío de Proforma:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="carlos.morales@distribuidoratech.sv"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Items in Quotation Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Partidas / Componentes de la Cotización ({items.length} ítems):
                    </label>
                    <Link
                      href="/"
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar más del catálogo
                    </Link>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50">
                      <p className="text-xs font-semibold text-slate-700">
                        No hay partidas agregadas todavía.
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Utiliza las plantillas rápidas de arriba o ve al catálogo para añadir componentes con un clic.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("PC Gamer / Ensambles")}
                        className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                      >
                        Cargar plantilla de ejemplo
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="p-3">Producto / SKU</th>
                            <th className="p-3 text-center">Cant.</th>
                            <th className="p-3 text-right">Precio B2B</th>
                            <th className="p-3 text-right">Subtotal</th>
                            <th className="p-3 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((item) => (
                            <tr key={item.producto.id} className="hover:bg-slate-50">
                              <td className="p-3">
                                <div className="font-bold text-slate-800">
                                  {item.producto.nombre}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  {item.producto.sku}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center border border-slate-200 rounded bg-slate-50">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(item.producto.id, item.cantidad - 1)
                                    }
                                    className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 py-0.5 font-bold text-slate-900 bg-white">
                                    {item.cantidad}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(item.producto.id, item.cantidad + 1)
                                    }
                                    className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-right font-semibold text-slate-700">
                                ${item.precioUnitario.toFixed(2)}
                              </td>
                              <td className="p-3 text-right font-bold text-slate-900">
                                ${(item.precioUnitario * item.cantidad).toFixed(2)}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.producto.id)}
                                  className="text-slate-300 hover:text-rose-600 transition p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Delivery and Validity preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Tiempo de Entrega Preferido:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Inmediato (24h)", "24 - 72 hrs", "Bajo Pedido (7-15d)"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTiempoEntrega(t)}
                          className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold transition ${
                            tiempoEntrega === t
                              ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Validez de la Oferta:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 8, 15, 30].map((dias) => (
                        <button
                          key={dias}
                          type="button"
                          onClick={() => setValidezDias(dias)}
                          className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold transition ${
                            validezDias === dias
                              ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {dias} Días
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes and File Attachment */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Comentarios adicionales o especificaciones técnicas:
                    </label>
                    <textarea
                      rows={2}
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Ej. Requerimos facturación separada para proyecto gubernamental, entrega en 2 direcciones..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Adjuntar Documento RFQ / Requerimiento en PDF o Excel (Opcional):
                    </label>
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100/70 transition">
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <label className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                        <span>Haz clic para seleccionar archivo</span>
                        <input
                          type="file"
                          accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                          onChange={(e) =>
                            setArchivoAdjunto(e.target.files ? e.target.files[0] : null)
                          }
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PDF, Excel o Word (Máx 25MB)
                      </p>
                      {archivoAdjunto && (
                        <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 py-1 px-2 rounded-md inline-block">
                          Archivo listo: {archivoAdjunto.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal Neto:</span>
                    <span>${subtotalNeto.toFixed(2)} USD</span>
                  </div>
                  {descuentoTotal > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Descuento B2B Aplicado:</span>
                      <span>-${descuentoTotal.toFixed(2)} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>IVA Trasladado (13%):</span>
                    <span>${ivaEstimado.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                    <span>Total Proforma Oficial:</span>
                    <span className="text-emerald-400 text-lg">
                      ${totalEstimado.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? "Procesando Cotización..."
                        : "Procesar y Guardar Cotización Formal"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Imprimir Proforma Formal</span>
                  </button>
                </div>
              </form>

              {/* Guarantee Footer Notice */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Garantía Techsmart Oficial B2B:</strong> Todos los componentes incluyen soporte directo mayorista, cambio express por falla DOA (7 días) y respaldo de marca con entrega en bodega central.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Cotizaciones Activas (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Active Quotes Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cotizaciones Activas
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {cotizacionesList.length} registradas
                </span>
              </div>

              <div className="mt-3 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {cotizacionesList.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400">
                    Aún no tienes cotizaciones registradas.
                  </p>
                )}
                {cotizacionesList.map((cot) => (
                  <div
                    key={cot.id}
                    onClick={() => setSelectedCotizacionModal(cot)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-400 hover:shadow-sm transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold font-mono text-blue-700">
                        {cot.folio}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cot.estado === "Aprobada"
                            ? "bg-emerald-100 text-emerald-800"
                            : cot.estado === "Despachada"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cot.estado}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-800 text-xs mt-1.5 line-clamp-1">
                      {cot.razonSocial}
                    </h4>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{cot.items.length} partidas</span>
                      <span className="font-bold text-slate-900 text-xs">
                        ${cot.total.toFixed(2)} USD
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Fecha: {cot.fecha}</span>
                      <span className="text-blue-600 font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Ver Detalle
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support / Licitaciones Card */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-md">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Licitaciones & Mayoreo B2B
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                ¿Necesita una carta de distribuidor autorizado o precio especial por contenedor/volumen para licitaciones públicas o privadas?
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  PBX: <strong>+503 2200-8800</strong>
                </span>
                <a
                  href="https://wa.me/50370008888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {selectedCotizacionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedCotizacionModal.folio}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedCotizacionModal.razonSocial}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCotizacionModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Contacto:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedCotizacionModal.contacto} ({selectedCotizacionModal.telefono})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estado:</span>
                  <span className="font-bold text-blue-700">
                    {selectedCotizacionModal.estado}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha de Emisión:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedCotizacionModal.fecha}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vigencia:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedCotizacionModal.vencimiento}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Ítems Cotizados:</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 font-bold text-slate-600">
                      <tr>
                        <th className="p-2">Producto</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-right">Unitario</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCotizacionModal.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{it.producto.nombre}</td>
                          <td className="p-2 text-center">{it.cantidad}</td>
                          <td className="p-2 text-right">${it.precioUnitario.toFixed(2)}</td>
                          <td className="p-2 text-right font-bold">
                            ${(it.precioUnitario * it.cantidad).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 text-right">
                <span className="text-xs text-slate-500">Total con IVA: </span>
                <span className="text-base font-bold text-blue-700">
                  ${selectedCotizacionModal.total.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition"
              >
                Imprimir Proforma
              </button>
              <button
                onClick={() => setSelectedCotizacionModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

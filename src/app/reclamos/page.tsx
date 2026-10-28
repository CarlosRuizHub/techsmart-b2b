"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  Wrench,
  PackageCheck,
  MapPin,
  Printer,
  ChevronRight,
  X,
} from "lucide-react";
import { TicketRMA, RMAEstado } from "@/src/lib/types";
import { getTicketsRMA, crearTicketRMA } from "@/src/lib/firebaseService";
import { SAMPLE_TICKETS_RMA } from "@/src/lib/sampleData";

export default function ReclamosPage() {
  const [tickets, setTickets] = useState<TicketRMA[]>(SAMPLE_TICKETS_RMA);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("Todos");
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketRMA | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    productoNombre: "",
    sku: "",
    numeroSerie: "",
    facturaReferencia: "",
    cliente: "Distribuidora Tech El Salvador S.A. de C.V.",
    contacto: "Ing. Carlos Morales",
    telefono: "+503 7123-4567",
    correo: "carlos.morales@distribuidoratech.sv",
    descripcionFalla: "",
    esDOA: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archivoEvidencia, setArchivoEvidencia] = useState<File | null>(null);

  useEffect(() => {
    async function loadTickets() {
      const data = await getTicketsRMA();
      setTickets(data);
    }
    loadTickets();
  }, []);

  const handleCreateRMA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const randomFolio = `RMA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const nuevoTicket: Omit<TicketRMA, "id"> = {
        folio: randomFolio,
        fecha: fechaStr,
        estado: formData.esDOA ? "Cambio Aprobado" : "Reportado",
        productoNombre: formData.productoNombre,
        sku: formData.sku,
        numeroSerie: formData.numeroSerie,
        facturaReferencia: formData.facturaReferencia,
        cliente: formData.cliente,
        contacto: formData.contacto,
        telefono: formData.telefono,
        correo: formData.correo,
        descripcionFalla: formData.descripcionFalla,
        esDOA: formData.esDOA,
        diagnosticoTecnico: formData.esDOA
          ? "Garantía DOA Express validada (menos de 7 días). Unidad sujeta a recambio directo en bodega."
          : "Caso ingresado. En espera de recepción física en el laboratorio técnico.",
      };

      const saved = await crearTicketRMA(nuevoTicket);
      setTickets((prev) => [saved, ...prev]);
      setShowNewModal(false);
      setFormData({
        productoNombre: "",
        sku: "",
        numeroSerie: "",
        facturaReferencia: "",
        cliente: "Distribuidora Tech El Salvador S.A. de C.V.",
        contacto: "Ing. Carlos Morales",
        telefono: "+503 7123-4567",
        correo: "carlos.morales@distribuidoratech.sv",
        descripcionFalla: "",
        esDOA: false,
      });
      alert(`¡Ticket de Garantía creado con éxito! Folio asignado: ${randomFolio}`);
    } catch (err) {
      console.error("Error creando RMA:", err);
      alert("Hubo un error al procesar la solicitud de garantía.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesEstado =
        filterEstado === "Todos" || t.estado === filterEstado;
      const matchesSearch =
        t.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.numeroSerie.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.productoNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cliente.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesEstado && matchesSearch;
    });
  }, [tickets, filterEstado, searchQuery]);

  // KPIs
  const totalActivos = tickets.filter((t) => t.estado !== "Cerrado").length;
  const totalAprobados = tickets.filter((t) => t.estado === "Cambio Aprobado").length;
  const totalDiagnostico = tickets.filter((t) => t.estado === "En Diagnóstico Técnico").length;
  const totalResueltos = tickets.filter((t) => t.estado === "Cerrado").length + 29; // total acumulado

  const getStepNumber = (estado: RMAEstado) => {
    switch (estado) {
      case "Reportado":
        return 1;
      case "Recibido en Bodega":
        return 2;
      case "En Diagnóstico Técnico":
        return 3;
      case "Cambio Aprobado":
      case "Cerrado":
        return 4;
      default:
        return 1;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Subheader Context */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/" className="hover:text-blue-600 transition">
                  Techsmart B2B
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-blue-600 font-medium">Reclamos y Garantías RMA</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                Portal de Garantías Oficiales & Soporte Técnico RMA
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Garantía DOA de 7 días con recambio express inmediato y gestión directa con fabricantes para integradores certificados.
              </p>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition self-start md:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Iniciar Solicitud RMA</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* KPI Cards (4 summary cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                Solicitudes Activas
              </span>
              <span className="text-xl font-bold text-slate-900">
                {totalActivos} Casos
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                Aprobados / Por Recibir
              </span>
              <span className="text-xl font-bold text-emerald-700">
                {totalAprobados} Casos
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                En Diagnóstico Técnico
              </span>
              <span className="text-xl font-bold text-slate-900">
                {totalDiagnostico} Equipos
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                Resueltos este Mes
              </span>
              <span className="text-xl font-bold text-purple-700">
                {totalResueltos} RMA
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: RMA Cases List (8 cols) + Policies & Centers (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* RMA Tickets List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter tools */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por # Serie, Folio RMA, SKU o Cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                {[
                  "Todos",
                  "Reportado",
                  "En Diagnóstico Técnico",
                  "Cambio Aprobado",
                  "Cerrado",
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterEstado(st)}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                      filterEstado === st
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {st === "En Diagnóstico Técnico" ? "Diagnóstico" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Tickets */}
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                  <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    No hay solicitudes con ese criterio
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Verifique el filtro seleccionado o inicie un nuevo ticket.
                  </p>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const step = getStepNumber(t.estado);
                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-blue-400 transition"
                    >
                      {/* Ticket Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {t.folio}
                          </span>
                          <span className="text-xs text-slate-400">
                            Ingresado el {t.fecha}
                          </span>
                          {t.esDOA && (
                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              DOA 7 Días
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            t.estado === "Cambio Aprobado"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : t.estado === "Cerrado"
                              ? "bg-slate-100 text-slate-700"
                              : t.estado === "En Diagnóstico Técnico"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.estado}
                        </span>
                      </div>

                      {/* Ticket Body */}
                      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {t.productoNombre}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                            <span>S/N: <strong className="text-slate-800">{t.numeroSerie}</strong></span>
                            <span>•</span>
                            <span>SKU: {t.sku}</span>
                            <span>•</span>
                            <span>Factura: {t.facturaReferencia}</span>
                          </div>

                          <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <span className="text-slate-500 font-semibold block mb-0.5">
                              Falla reportada:
                            </span>
                            <p className="text-slate-700 leading-relaxed">
                              {t.descripcionFalla}
                            </p>
                          </div>

                          {t.diagnosticoTecnico && (
                            <div className="mt-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
                              <span className="font-semibold block mb-0.5 flex items-center gap-1.5">
                                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                                Dictamen Técnico Oficial:
                              </span>
                              <p className="leading-relaxed">{t.diagnosticoTecnico}</p>
                            </div>
                          )}
                        </div>

                        {/* Customer & Actions Column */}
                        <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 md:pl-4 pt-3 md:pt-0 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Cliente:</span>
                            <span className="font-semibold text-slate-800 block truncate">
                              {t.cliente}
                            </span>
                            <span className="text-slate-500 block text-[11px] mt-0.5">
                              {t.contacto} ({t.telefono})
                            </span>
                          </div>

                          <div className="mt-3 space-y-1.5">
                            <button
                              onClick={() => setSelectedTicket(t)}
                              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                            >
                              Ver Seguimiento Completo
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              Imprimir Hoja RMA
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4-Step Progress Tracker */}
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                          {/* Step 1 */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${
                                step >= 1
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              ✓
                            </div>
                            <span className="font-semibold text-slate-800">1. Reportado</span>
                          </div>

                          {/* Step 2 */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${
                                step >= 2
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {step >= 2 ? "✓" : "2"}
                            </div>
                            <span className="font-semibold text-slate-800">2. Recibido</span>
                          </div>

                          {/* Step 3 */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${
                                step >= 3
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {step >= 3 ? "✓" : "3"}
                            </div>
                            <span className="font-semibold text-slate-800">3. En Taller</span>
                          </div>

                          {/* Step 4 */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${
                                step >= 4
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {step >= 4 ? "✓" : "4"}
                            </div>
                            <span className="font-semibold text-slate-800">4. Resolución</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Policies & Reception Centers (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Guarantee Policy Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Políticas de Garantía Techsmart
              </h3>

              <div className="mt-3.5 space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Reemplazo Inmediato DOA (7 Días)
                  </h4>
                  <p className="text-emerald-800 text-[11px]">
                    Si un componente nuevo presenta defecto de fábrica en sus primeros 7 días naturales, se cambia de inmediato por una unidad nueva sellada en bodega sin esperar diagnóstico prolongado.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-1">
                    Garantía Estándar de Marca (1 a 3 Años)
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    Techsmart gestiona directamente con ASUS, Kingston, Intel y Corsair el reemplazo de piezas originales con trazabilidad de número de serie.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                  <h4 className="font-bold text-rose-900 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Exclusiones de Cobertura
                  </h4>
                  <p className="text-rose-800 text-[11px]">
                    Daño físico visible, pines doblados en sockets de procesadores, pistas quemadas por descargas eléctricas o sellos de serie removidos.
                  </p>
                </div>
              </div>
            </div>

            {/* Reception Centers */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-blue-600" />
                Centros de Recepción RMA
              </h3>

              <div className="mt-3 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block">
                    Bodega Central & Laboratorio Técnico
                  </span>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Km 10.5 Carretera al Puerto de La Libertad, Complejo Industrial Techsmart, Módulo 4.
                  </p>
                  <span className="text-[10px] text-blue-700 font-semibold block mt-1">
                    Lunes a Viernes: 8:00 AM - 5:00 PM
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block">
                    Sucursal San Salvador (Recepción Rápida)
                  </span>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Blvd. Los Héroes #420, Condominio Metro Tech.
                  </p>
                  <span className="text-[10px] text-blue-700 font-semibold block mt-1">
                    Lunes a Sábado: 8:00 AM - 12:30 PM
                  </span>
                </div>
              </div>
            </div>

            {/* Prime SLA Commitment */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm text-xs">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1">
                Compromiso Techsmart Prime
              </span>
              <h4 className="font-bold text-sm">Tiempo Promedio de Diagnóstico</h4>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Menos de <strong>48 horas hábiles</strong> para resolución o emisión de nota de crédito para clientes distribuidores activos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New RMA Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Nueva Solicitud de Garantía RMA
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRMA} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="esDOA"
                  checked={formData.esDOA}
                  onChange={(e) =>
                    setFormData({ ...formData, esDOA: e.target.checked })
                  }
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="esDOA" className="text-blue-900 cursor-pointer">
                  <strong className="block">¿Falla en los primeros 7 días (DOA)?</strong>
                  <span className="text-[11px] text-blue-700">
                    Aplica para recambio express directo de bodega por unidad nueva sellada.
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Factura o CCF Techsmart:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="FAC-49102"
                    value={formData.facturaReferencia}
                    onChange={(e) =>
                      setFormData({ ...formData, facturaReferencia: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Número de Serie (S/N):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SN-9482019482"
                    value={formData.numeroSerie}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroSerie: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Producto / Modelo:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. SSD Kingston NV2 1TB"
                    value={formData.productoNombre}
                    onChange={(e) =>
                      setFormData({ ...formData, productoNombre: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    SKU del Producto:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="KING-SSD-NV2-1TB"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Descripción Detallada de la Falla:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describa el comportamiento del dispositivo, si enciende, códigos de error o pruebas realizadas..."
                  value={formData.descripcionFalla}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcionFalla: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Evidencia fotográfica (etiqueta de serie o falla):
                </label>
                <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50">
                  <label className="text-blue-600 font-semibold cursor-pointer">
                    Seleccionar imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setArchivoEvidencia(e.target.files ? e.target.files[0] : null)
                      }
                      className="hidden"
                    />
                  </label>
                  {archivoEvidencia && (
                    <span className="block text-[11px] text-emerald-600 mt-1 font-semibold">
                      Adjunto: {archivoEvidencia.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm"
                >
                  {isSubmitting ? "Registrando..." : "Registrar Caso RMA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Tracking Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                {selectedTicket.folio}
              </span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedTicket.productoNombre}
              </h3>
              <p className="text-slate-500 font-mono">
                S/N: {selectedTicket.numeroSerie} • Factura: {selectedTicket.facturaReferencia}
              </p>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 block font-semibold">Falla Registrada:</span>
                <p className="text-slate-700">{selectedTicket.descripcionFalla}</p>
              </div>

              {selectedTicket.diagnosticoTecnico && (
                <div className="p-3 bg-blue-50 rounded-xl space-y-1 text-blue-950">
                  <span className="font-bold block">Laboratorio Técnico:</span>
                  <p>{selectedTicket.diagnosticoTecnico}</p>
                </div>
              )}

              {selectedTicket.resolucion && (
                <div className="p-3 bg-emerald-50 rounded-xl space-y-1 text-emerald-950">
                  <span className="font-bold block">Resolución / Entrega:</span>
                  <p>{selectedTicket.resolucion}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Imprimir Comprobante
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
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

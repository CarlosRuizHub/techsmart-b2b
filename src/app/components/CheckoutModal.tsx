"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  CreditCard,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Truck,
  Lock,
  User,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/src/lib/CartContext";
import {guardarOrdenCompra} from "@/src/lib/firebaseService";

type MetodoPago = "linea_credito" | "tarjeta";

const DEPARTAMENTOS_SV = [
  "San Salvador",
  "La Libertad",
  "Santa Ana",
  "San Miguel",
  "Sonsonate",
  "Ahuachapán",
  "Usulután",
  "La Paz",
  "Chalatenango",
  "Cuscatlán",
  "Morazán",
  "San Vicente",
  "Cabañas",
  "La Unión",
];

export default function CheckoutModal() {
  const {
    items,
    subtotalNeto,
    ivaEstimado,
    totalEstimado,
    lineaCreditoDisponible,
    currentUser,
    clearCart,
    isCheckoutOpen,
    closeCheckoutModal,
  } = useCart();

  // Método de pago
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("linea_credito");

  // Despacho y entrega
  const [departamento, setDepartamento] = useState("Santa Ana");
  const [direccionExacta, setDireccionExacta] = useState("");
  const [personaRecibe, setPersonaRecibe] = useState(currentUser?.nombreContacto || "");
  const [telefonoContacto, setTelefonoContacto] = useState(currentUser?.telefono || "");

  // Tarjeta
  const [tarjetaNumero, setTarjetaNumero] = useState("");
  const [tarjetaNombre, setTarjetaNombre] = useState("");
  const [tarjetaExp, setTarjetaExp] = useState("");
  const [tarjetaCvv, setTarjetaCvv] = useState("");

  // Estados de proceso
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Formateador de tarjeta (16 dígitos en bloques de 4)
  const handleNumeroTarjetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setTarjetaNumero(formatted);
  };

  // Formateador de fecha MM/YY
  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setTarjetaExp(raw);
  };

  // Formateador de CVV (3 o 4 dígitos)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setTarjetaCvv(raw);
  };

  // Formateador de teléfono El Salvador (####-####)
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (raw.length > 4) {
      setTelefonoContacto(`${raw.slice(0, 4)}-${raw.slice(4)}`);
    } else {
      setTelefonoContacto(raw);
    }
  };

  // ================= VALIDACIONES DETALLADAS =================

  // Validación de número de tarjeta
  const numeroLimpio = tarjetaNumero.replace(/\s/g, "");
  const errorNumeroTarjeta = useMemo(() => {
    if (!tarjetaNumero) return null;
    if (numeroLimpio.length < 16) {
      return `Faltan ${16 - numeroLimpio.length} dígitos (requiere 16)`;
    }
    return null;
  }, [tarjetaNumero, numeroLimpio]);

  // Validación de nombre del titular
  const errorNombreTitular = useMemo(() => {
    if (!tarjetaNombre) return null;
    if (tarjetaNombre.trim().length < 5) {
      return "Ingresa el nombre completo tal como figura en el plástico";
    }
    return null;
  }, [tarjetaNombre]);

  // Validación exacta de fecha de vencimiento (Mes y Año)
  const errorFechaExp = useMemo(() => {
    if (!tarjetaExp) return null;
    if (tarjetaExp.length < 5) {
      return "Formato incompleto: ingresa MM/AA";
    }

    const [mesStr, anioStr] = tarjetaExp.split("/");
    const mes = parseInt(mesStr, 10);
    const anio = parseInt(`20${anioStr}`, 10);

    if (isNaN(mes) || mes < 1 || mes > 12) {
      return `Mes inválido (${mesStr}): debe ser entre 01 y 12`;
    }

    if (isNaN(anio) || anioStr.length !== 2) {
      return "Año inválido";
    }

    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;

    if (anio < anioActual) {
      return `Tarjeta vencida: el año ${anio} ya pasó`;
    }
    if (anio === anioActual && mes < mesActual) {
      return `Tarjeta vencida: el mes ${mesStr}/${anioStr} ya pasó`;
    }
    if (anio > anioActual + 20) {
      return "El año ingresado está fuera de rango";
    }

    return null;
  }, [tarjetaExp]);

  // Validación de CVV
  const errorCvv = useMemo(() => {
    if (!tarjetaCvv) return null;
    if (tarjetaCvv.length < 3) {
      return "El CVV requiere al menos 3 dígitos";
    }
    return null;
  }, [tarjetaCvv]);

  // Validación de teléfono (8 dígitos en El Salvador)
  const telLimpio = telefonoContacto.replace(/\D/g, "");
  const errorTelefono = useMemo(() => {
    if (!telefonoContacto) return null;
    if (telLimpio.length < 8) {
      return "Ingresa un número telefónico de 8 dígitos";
    }
    return null;
  }, [telefonoContacto, telLimpio]);

  // Validación de dirección
  const errorDireccion = useMemo(() => {
    if (!direccionExacta) return null;
    if (direccionExacta.trim().length < 8) {
      return "Ingresa una dirección más específica (mínimo 8 caracteres)";
    }
    return null;
  }, [direccionExacta]);

  // Validación general del formulario
  const creditoSuficiente = lineaCreditoDisponible >= totalEstimado;

  const formularioValido = useMemo(() => {
    if (items.length === 0 || totalEstimado <= 0) return false;
    if (direccionExacta.trim().length < 8 || errorDireccion) return false;
    if (personaRecibe.trim().length < 3) return false;
    if (telLimpio.length < 8 || errorTelefono) return false;

    if (metodoPago === "linea_credito") {
      return creditoSuficiente;
    }

    if (metodoPago === "tarjeta") {
      const tarjetaOk = numeroLimpio.length === 16 && !errorNumeroTarjeta;
      const titularOk = tarjetaNombre.trim().length >= 5 && !errorNombreTitular;
      const fechaOk = tarjetaExp.length === 5 && !errorFechaExp;
      const cvvOk = tarjetaCvv.length >= 3 && !errorCvv;
      return tarjetaOk && titularOk && fechaOk && cvvOk;
    }

    return false;
  }, [
    items.length,
    totalEstimado,
    direccionExacta,
    errorDireccion,
    personaRecibe,
    telLimpio.length,
    errorTelefono,
    metodoPago,
    creditoSuficiente,
    numeroLimpio.length,
    errorNumeroTarjeta,
    tarjetaNombre,
    errorNombreTitular,
    tarjetaExp.length,
    errorFechaExp,
    tarjetaCvv.length,
    errorCvv,
  ]);

  const limpiarFormulario = () => {
    setDireccionExacta("");
    setPersonaRecibe(currentUser?.nombreContacto || "");
    setTelefonoContacto(currentUser?.telefono || "");
    setDepartamento("Santa Ana");
    setTarjetaNumero("");
    setTarjetaNombre("");
    setTarjetaExp("");
    setTarjetaCvv("");
    setMetodoPago("linea_credito");
    setOrderSuccess(null);
  };

  const handleIntentarCerrar = () => {
    if (orderSuccess) {
      limpiarFormulario();
      closeCheckoutModal();
      return;
    }

    const hayDatosIngresados =
      direccionExacta.trim().length > 0 ||
      tarjetaNumero.trim().length > 0 ||
      tarjetaNombre.trim().length > 0 ||
      tarjetaExp.trim().length > 0 ||
      tarjetaCvv.trim().length > 0;

    if (hayDatosIngresados) {
      const confirmar = window.confirm(
        "¿Estás seguro de que deseas salir? Se cancelará la orden y se borrarán todos los datos ingresados."
      );
      if (!confirmar) return;
      toast.info("Formulario de orden descartado");
    }

    limpiarFormulario();
    closeCheckoutModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (items.length === 0) {
    toast.warning("Lista vacía", {
      description: "Agrega productos desde el catálogo antes de procesar la orden.",
    });
    return;
  }

  if (!formularioValido || isProcessing) {
    if (metodoPago === "tarjeta" && errorFechaExp) {
      toast.error("Error en tarjeta", { description: errorFechaExp });
    } else {
      toast.error("Datos incompletos", {
        description: "Por favor revisa los campos en rojo antes de continuar.",
      });
    }
    return;
  }

  setIsProcessing(true);
  const toastCargando = toast.loading("Procesando transacción segura con el banco...");

  try {
    const folioOrden = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Identificar tipo de tarjeta según el primer dígito (4 = Visa, 5 = Mastercard)
    const primerDigito = numeroLimpio.charAt(0);
    const marcaDetectada = primerDigito === "4" ? "Visa" : primerDigito === "5" ? "Mastercard" : "Tarjeta Débito/Crédito";

    // ESTRUCTURA SEGURA: Jamás se envía ni se guarda el CVV ni el número completo
    const payloadOrden = {
      folio: folioOrden,
      usuarioCorreo: currentUser?.correo || "cliente@techsmart.sv",
      fecha: new Date().toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      items,
      subtotal: subtotalNeto,
      iva: ivaEstimado,
      total: totalEstimado,
      metodoPago,
      detallePago: {
        tipo: metodoPago,
        // Solo se guardan los últimos 4 dígitos visibles
        ultimosCuatroDigitos: metodoPago === "tarjeta" ? numeroLimpio.slice(-4) : undefined,
        titular: metodoPago === "tarjeta" ? tarjetaNombre.trim() : currentUser?.razonSocial || "Cliente Corporativo",
        marcaTarjeta: metodoPago === "tarjeta" ? marcaDetectada : undefined,
      },
      envio: {
        departamento,
        direccionExacta: direccionExacta.trim(),
        personaRecibe: personaRecibe.trim(),
        telefonoContacto: telefonoContacto.trim(),
      },
      estado: "procesando" as const,
    };

    // Guardado en Firestore bajo la colección "ordenes_compra"
    await guardarOrdenCompra(payloadOrden);

    setOrderSuccess(folioOrden);
    clearCart();

    toast.dismiss(toastCargando);
    toast.success("¡Pago registrado y orden creada!", {
      description: `Orden ${folioOrden} guardada en su historial. Despacho hacia ${departamento}.`,
      duration: 5000,
    });
  } catch (err: unknown) {
    console.error("Error al procesar orden:", err);
    toast.dismiss(toastCargando);
    const mensaje = err instanceof Error ? err.message : "Error al registrar la orden.";
    toast.error("Error en la orden", {
      description: mensaje,
    });
  } finally {
    setIsProcessing(false);
  }
};

  if (!isCheckoutOpen) return null;

  return (
    <div
      onClick={handleIntentarCerrar}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 my-auto animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Finalizar Orden y Pagar
            </h2>
            <p className="text-[11px] text-slate-500">
              Distribución Mayorista El Salvador • Techsmart B2B S.A. de C.V.
            </p>
          </div>
          <button
            type="button"
            onClick={handleIntentarCerrar}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ¡Pago y Orden Confirmados!
              </h3>
              <p className="font-mono text-sm font-bold text-blue-700 mt-1">
                Folio: {orderSuccess}
              </p>
              <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Su despacho ha sido programado hacia{" "}
                <strong>{departamento}</strong> con entrega en 24-72 horas. Se ha
                enviado el comprobante fiscal a su correo registrado.
              </p>
            </div>

            <button
              type="button"
              onClick={handleIntentarCerrar}
              className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cerrar y Volver al Sistema
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Aviso si el carrito está vacío */}
            {items.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  No hay productos en la lista de cotización. Agrega ítems desde el catálogo para poder pagar.
                </span>
              </div>
            )}

            {/* 1. SELECCIÓN DE MÉTODO DE PAGO */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Método de Pago:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMetodoPago("linea_credito");
                    toast.info("Método seleccionado", { description: "Línea de Crédito B2B activa" });
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    metodoPago === "linea_credito"
                      ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <Building2
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      metodoPago === "linea_credito" ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block">
                      Línea de Crédito B2B
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Saldo:{" "}
                      <strong className="text-slate-800">
                        ${lineaCreditoDisponible.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </strong>
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMetodoPago("tarjeta");
                    toast.info("Método seleccionado", { description: "Pasarela de Tarjeta Débito / Crédito" });
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    metodoPago === "tarjeta"
                      ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <CreditCard
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      metodoPago === "tarjeta" ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block">
                      Tarjeta de Crédito / Débito
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Visa / Mastercard (Seguro)
                    </span>
                  </div>
                </button>
              </div>

              {metodoPago === "linea_credito" && !creditoSuficiente && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Saldo de crédito insuficiente para cubrir ${totalEstimado.toFixed(2)} USD. Seleccione pago con tarjeta.
                  </span>
                </div>
              )}
            </div>

            {/* 2. CAMPOS DE TARJETA CON VALIDACIONES */}
            {metodoPago === "tarjeta" && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    Datos de la Tarjeta
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Procesamiento SSL 256-bit
                  </span>
                </div>

                {/* Número de tarjeta */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Número de Tarjeta (16 dígitos):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4500 0000 0000 0000"
                    value={tarjetaNumero}
                    onChange={handleNumeroTarjetaChange}
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono text-slate-800 focus:outline-none transition ${
                      errorNumeroTarjeta
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : numeroLimpio.length === 16
                        ? "border-emerald-500 focus:border-emerald-600"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {errorNumeroTarjeta && (
                    <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errorNumeroTarjeta}
                    </p>
                  )}
                </div>

                {/* Titular */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Nombre del Titular (Como aparece en el plástico):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CARLOS ALFREDO RUIZ"
                    value={tarjetaNombre}
                    onChange={(e) => setTarjetaNombre(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-xs uppercase text-slate-800 focus:outline-none transition ${
                      errorNombreTitular
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {errorNombreTitular && (
                    <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errorNombreTitular}
                    </p>
                  )}
                </div>

                {/* Vencimiento y CVV */}
                <div className="grid grid-cols-2 gap-3 items-start">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Vencimiento (MM/YY):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={tarjetaExp}
                      onChange={handleExpChange}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono text-slate-800 focus:outline-none transition ${
                        errorFechaExp
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                          : tarjetaExp.length === 5
                          ? "border-emerald-500 focus:border-emerald-600"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />
                    {errorFechaExp && (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 leading-tight">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errorFechaExp}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Código de Seguridad (CVV):
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={tarjetaCvv}
                      onChange={handleCvvChange}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono text-slate-800 focus:outline-none transition ${
                        errorCvv
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                          : tarjetaCvv.length >= 3
                          ? "border-emerald-500 focus:border-emerald-600"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />
                    {errorCvv && (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errorCvv}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. DIRECCIÓN Y CONTACTO DE DESPACHO */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                Destino de Envío & Despacho:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Departamento:
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {DEPARTAMENTOS_SV.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Teléfono de Contacto (8 dígitos):
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="7447-0810"
                      value={telefonoContacto}
                      onChange={handleTelefonoChange}
                      className={`w-full pl-8 pr-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 focus:outline-none transition ${
                        errorTelefono
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />
                  </div>
                  {errorTelefono && (
                    <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errorTelefono}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Nombre de la persona que recibe:
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Carlos Segoviano / Encargado de Recepción"
                    value={personaRecibe}
                    onChange={(e) => setPersonaRecibe(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Dirección exacta de entrega (Calle, Colonia, N° Local o Polígono):
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <textarea
                    rows={2}
                    required
                    placeholder="Ej. Colonia Santa Barbara, Pasaje Los Olivos #12..."
                    value={direccionExacta}
                    onChange={(e) => setDireccionExacta(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800 focus:outline-none transition ${
                      errorDireccion
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errorDireccion && (
                  <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errorDireccion}
                  </p>
                )}
              </div>
            </div>

            {/* 4. RESUMEN FISCAL */}
            <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>Subtotal Neto ({items.length} ítems):</span>
                <span>${subtotalNeto.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>IVA Trasladado (13%):</span>
                <span>${ivaEstimado.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-bold text-white pt-1.5 border-t border-slate-800">
                <span>Total a Pagar:</span>
                <span className="text-emerald-400 font-mono">
                  ${totalEstimado.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* 5. BOTÓN DE PAGO Y DESPACHO */}
            <button
              type="submit"
              disabled={!formularioValido || isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isProcessing
                  ? "Procesando Transacción Segura..."
                  : metodoPago === "linea_credito"
                  ? `Confirmar Cargo a Línea de Crédito ($${totalEstimado.toFixed(2)} USD)`
                  : `Procesar Pago con Tarjeta ($${totalEstimado.toFixed(2)} USD)`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  Phone,
  FileText,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/src/lib/CartContext";
import {
  iniciarSesion,
  registrarUsuario,
  enviarRecuperacionPassword,
  mensajeErrorAuth,
} from "@/src/lib/firebaseService";

export default function AuthModal() {
  const { isAuthOpen, closeAuthModal, login } = useCart();

  const [tab, setTab] = useState<"login" | "registro" | "recuperar">("login");
  const [tipoCuenta, setTipoCuenta] = useState<"empresarial" | "personal">("empresarial");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Estados del formulario
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [dui, setDui] = useState("");
  const [razonSocial, setRazonSocial] = useState("");

  // ================= FORMATEADORES AUTOMÁTICOS (MÁSCARAS) =================

  // Formato DUI El Salvador: 8 dígitos + guion + 1 dígito (########-#)
  const handleDuiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    if (raw.length > 8) {
      setDui(`${raw.slice(0, 8)}-${raw.slice(8)}`);
    } else {
      setDui(raw);
    }
  };

  // Formato Teléfono El Salvador: 4 dígitos + guion + 4 dígitos (####-####)
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (raw.length > 4) {
      setTelefono(`${raw.slice(0, 4)}-${raw.slice(4)}`);
    } else {
      setTelefono(raw);
    }
  };

  // ================= REINICIO DE FORMULARIO AL CAMBIAR TIPO =================

  const handleCambiarTipoCuenta = (nuevoTipo: "empresarial" | "personal") => {
    if (nuevoTipo === tipoCuenta) return;
    setTipoCuenta(nuevoTipo);

    // Limpieza completa de campos para evitar datos cruzados y errores de validación
    setNombreContacto("");
    setRazonSocial("");
    setTelefono("");
    setDui("");
    setCorreo("");
    setPassword("");
    setConfirmPassword("");

    toast.info("Tipo de cuenta actualizado", {
      description: `Formulario adaptado para cuenta ${nuevoTipo === "empresarial" ? "Empresarial" : "Personal"}.`,
    });
  };

  // ================= VALIDACIONES EN TIEMPO REAL =================

  const duiLimpio = useMemo(() => dui.replace(/\D/g, ""), [dui]);
  const esDuiValido = useMemo(() => duiLimpio.length === 9, [duiLimpio]);
  const errorDui = useMemo(() => {
    if (!dui) return null;
    if (duiLimpio.length < 9) {
      return `DUI incompleto: faltan ${9 - duiLimpio.length} dígitos (formato ########-#)`;
    }
    return null;
  }, [dui, duiLimpio]);

  const telLimpio = useMemo(() => telefono.replace(/\D/g, ""), [telefono]);
  const esTelefonoValido = useMemo(() => telLimpio.length === 8, [telLimpio]);
  const errorTelefono = useMemo(() => {
    if (!telefono) return null;
    if (telLimpio.length < 8) {
      return `Teléfono incompleto: faltan ${8 - telLimpio.length} dígitos (formato ####-####)`;
    }
    return null;
  }, [telefono, telLimpio]);

  const passwordLongitudValida = useMemo(() => password.length >= 6, [password]);

  const passwordsCoinciden = useMemo(() => {
    return (
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }, [password, confirmPassword]);

  const errorNoCoinciden = useMemo(() => {
    return confirmPassword.length > 0 && password !== confirmPassword;
  }, [password, confirmPassword]);

  const esCorreoValido = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  }, [correo]);

  const formularioRegistroValido = useMemo(() => {
    if (!nombreContacto.trim() || nombreContacto.trim().length < 3) return false;
    if (tipoCuenta === "empresarial" && (!razonSocial.trim() || razonSocial.trim().length < 3)) return false;
    if (!esTelefonoValido || !esDuiValido || !esCorreoValido) return false;
    if (!passwordLongitudValida || !passwordsCoinciden) return false;
    return true;
  }, [
    nombreContacto,
    tipoCuenta,
    razonSocial,
    esTelefonoValido,
    esDuiValido,
    esCorreoValido,
    passwordLongitudValida,
    passwordsCoinciden,
  ]);

  if (!isAuthOpen) return null;

  const handleCerrar = () => {
    setTab("login");
    setCorreo("");
    setPassword("");
    setConfirmPassword("");
    setDui("");
    setTelefono("");
    setNombreContacto("");
    setRazonSocial("");
    closeAuthModal();
  };

  // 1. Envío de correo de recuperación
  const handleRecuperarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) {
      toast.warning("Campo requerido", {
        description: "Por favor ingresa tu correo electrónico para enviarte el enlace.",
      });
      return;
    }

    setCargando(true);
    const toastId = toast.loading("Enviando enlace seguro de recuperación...");

    try {
      await enviarRecuperacionPassword(correo);
      toast.dismiss(toastId);
      toast.success("Enlace enviado con éxito", {
        description: `Hemos enviado un enlace a ${correo}. Revisa tu bandeja de entrada o spam.`,
        duration: 6000,
      });
      setTab("login");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Error al enviar el enlace", {
        description: mensajeErrorAuth(err),
      });
    } finally {
      setCargando(false);
    }
  };

  // 2. Inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    const toastId = toast.loading("Iniciando sesión en Techsmart B2B...");

    try {
      const usuario = await iniciarSesion(correo, password);
      login(usuario);
      toast.dismiss(toastId);
      toast.success("¡Bienvenido nuevamente!", {
        description: `Sesión iniciada como ${usuario.nombreContacto || usuario.correo}`,
      });
      handleCerrar();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Error de autenticación", {
        description: mensajeErrorAuth(err),
      });
    } finally {
      setCargando(false);
    }
  };

  // 3. Registro de usuario
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!esDuiValido) {
      toast.warning("DUI incompleto", {
        description: "El DUI debe contener exactamente 9 dígitos numéricos.",
      });
      return;
    }

    if (!esTelefonoValido) {
      toast.warning("Teléfono incompleto", {
        description: "El número telefónico debe contener 8 dígitos.",
      });
      return;
    }

    if (!passwordLongitudValida || !passwordsCoinciden) {
      toast.error("Error en contraseñas", {
        description: "Verifica que las contraseñas coincidan y tengan al menos 6 caracteres.",
      });
      return;
    }

    setCargando(true);
    const toastId = toast.loading("Creando tu cuenta mayorista...");

    try {
      const nuevoUsuario = await registrarUsuario({
        correo,
        password,
        nombreContacto,
        telefono,
        tipoCuenta,
        nit: dui || undefined,
        razonSocial: tipoCuenta === "empresarial" ? razonSocial : undefined,
      });

      login(nuevoUsuario);
      toast.dismiss(toastId);
      toast.success("Cuenta creada exitosamente", {
        description: "Línea de crédito inicial B2B asignada a tu perfil.",
      });
      handleCerrar();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Error al registrarse", {
        description: mensajeErrorAuth(err),
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      onClick={handleCerrar}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 my-auto animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Portal Techsmart
              </h3>
              <p className="text-xs text-slate-500">
                {tab === "recuperar"
                  ? "Recupera el acceso a tu cuenta"
                  : "Accede a tu cuenta o crea una nueva"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCerrar}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de pestañas */}
        {tab !== "recuperar" && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mt-4 shrink-0">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                tab === "login"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setTab("registro")}
              className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                tab === "registro"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* 1. VISTA DE INICIO DE SESIÓN */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Correo Electrónico:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="usuario@tuempresa.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Contraseña:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={mostrarPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {mostrarPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setTab("recuperar")}
                  className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-semibold transition cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{cargando ? "Iniciando..." : "Iniciar Sesión"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 2. VISTA DE RECUPERAR CONTRASEÑA */}
        {tab === "recuperar" && (
          <form onSubmit={handleRecuperarPassword} className="mt-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-800">
              <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Ingresa tu correo registrado. Te enviaremos un <strong>enlace exclusivo</strong> para que puedas crear una nueva contraseña de forma segura.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Correo Electrónico Registrado:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="usuario@tuempresa.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={cargando}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{cargando ? "Enviando..." : "Enviar Enlace de Recuperación"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setTab("login")}
                className="w-full py-2 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Iniciar Sesión</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. VISTA DE REGISTRO */}
        {tab === "registro" && (
          <form onSubmit={handleRegistro} className="mt-4 space-y-3 overflow-y-auto pr-1">
            {/* Alternador de Tipo de Cuenta con Limpieza Automática */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCambiarTipoCuenta("empresarial")}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  tipoCuenta === "empresarial"
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold">Empresarial</span>
              </button>

              <button
                type="button"
                onClick={() => handleCambiarTipoCuenta("personal")}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  tipoCuenta === "personal"
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold">Personal</span>
              </button>
            </div>

            {/* Nombre de Contacto */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Nombre de Contacto / Encargado:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Oscar Sanchez"
                  value={nombreContacto}
                  onChange={(e) => setNombreContacto(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Razón Social (Solo Empresarial) */}
            {tipoCuenta === "empresarial" && (
              <div className="animate-in fade-in">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Razón Social / Empresa:
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Tech Solutions S.A. de C.V."
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Teléfono y DUI en 2 columnas */}
            <div className="grid grid-cols-2 gap-2 items-start">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Teléfono (8 dígitos):
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="7489-1725"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 font-mono focus:outline-none transition ${
                      errorTelefono
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : esTelefonoValido
                        ? "border-emerald-500 focus:border-emerald-600"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errorTelefono && (
                  <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 leading-tight">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errorTelefono}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  DUI (9 dígitos):
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="01478965-7"
                    value={dui}
                    onChange={handleDuiChange}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 font-mono focus:outline-none transition ${
                      errorDui
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : esDuiValido
                        ? "border-emerald-500 focus:border-emerald-600"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errorDui && (
                  <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 leading-tight">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errorDui}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Correo Electrónico:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="compras@tuempresa.sv"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none transition ${
                    correo && !esCorreoValido
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Contraseña (mínimo 6 caracteres):
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={mostrarPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none transition ${
                    password.length > 0 && !passwordLongitudValida
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {mostrarPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {password.length > 0 && !passwordLongitudValida && (
                <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Requiere al menos 6 caracteres.
                </p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Confirmar Contraseña:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={mostrarConfirmar ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none transition ${
                    errorNoCoinciden
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : passwordsCoinciden
                      ? "border-emerald-500 focus:border-emerald-600 bg-emerald-50/20"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {mostrarConfirmar ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {errorNoCoinciden && (
                <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Las contraseñas no coinciden.</span>
                </p>
              )}

              {passwordsCoinciden && (
                <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 animate-in fade-in font-medium">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Las contraseñas coinciden correctamente.</span>
                </p>
              )}
            </div>

            {/* Botón de Registro */}
            <button
              type="submit"
              disabled={cargando || !formularioRegistroValido}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-3"
            >
              <span>{cargando ? "Registrando..." : "Crear Cuenta"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
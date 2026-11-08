"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Building2,
  PhoneCall,
  User,
  Eye,
  EyeOff,
  X,
  Sparkles,
  FileText,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner"; // <-- Notificaciones elegantes
import { useCart } from "@/src/lib/CartContext";
import {
  registrarUsuario,
  iniciarSesion,
  mensajeErrorAuth,
} from "@/src/lib/firebaseService";

export default function AuthModal() {
  const router = useRouter();
  const { isAuthOpen, closeAuthModal, login } = useCart();

  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visibilidad de contraseñas
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Tipo de cuenta
  const [tipoCuenta, setTipoCuenta] = useState<"empresarial" | "personal">("empresarial");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Registro
  const [regEmpresa, setRegEmpresa] = useState("");
  const [regNit, setRegNit] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDui, setRegDui] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  if (!isAuthOpen) return null;

  // Formato automático de DUI: ########-#
  const handleDuiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 9);
    if (rawDigits.length > 8) {
      setRegDui(`${rawDigits.slice(0, 8)}-${rawDigits.slice(8)}`);
    } else {
      setRegDui(rawDigits);
    }
  };

  // Inicio de sesión con Firebase Authentication y redirección a Home ("/")
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Firebase valida el correo y la contraseña; devuelve el perfil del cliente
      const user = await iniciarSesion(loginEmail, loginPass);

      // 1. Activar sesión global
      login(user);

      // 2. Notificación de bienvenida
      toast.success(`¡Bienvenido de nuevo!`, {
        description: `Sesión iniciada como ${user.nombreContacto || user.razonSocial}.`,
      });

      // 3. Cerrar modal y redirigir inmediatamente a Home
      closeAuthModal();
      router.push("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("No se pudo iniciar sesión", {
        description: mensajeErrorAuth(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registro con Firebase Authentication + perfil en Firestore
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regPassword.length < 6) {
      toast.warning("Contraseña muy corta", {
        description: "Debe contener al menos 6 caracteres.",
      });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error("Las contraseñas no coinciden", {
        description: "Asegúrate de escribir exactamente la misma clave.",
      });
      return;
    }

    if (tipoCuenta === "personal" && regDui && regDui.length < 10) {
      toast.warning("Formato de DUI incompleto", {
        description: "Debe contener 9 dígitos con su guión (ej. 12345678-9).",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // La línea de crédito inicial se asigna dentro de registrarUsuario según el tipo de cuenta
      const nuevoUsuario = await registrarUsuario({
        tipoCuenta,
        razonSocial: tipoCuenta === "empresarial" ? regEmpresa : regNombre,
        nit: tipoCuenta === "empresarial" ? regNit : (regDui || "Consumidor Final"),
        nombreContacto: regNombre,
        telefono: regTelefono,
        correo: regEmail,
        password: regPassword,
      });

      // Firebase Auth ya dejó la sesión iniciada: se activa en la plataforma
      login(nuevoUsuario);

      // Notificación estilizada de cuenta creada
      toast.success(
        `¡Cuenta ${tipoCuenta === "empresarial" ? "Empresarial" : "Personal"} creada con éxito!`,
        {
          description: "Tu sesión ya está iniciada.",
          duration: 5000,
        }
      );

      setRegPassword("");
      setRegConfirmPassword("");

      // Cerrar modal y redirigir a Home
      closeAuthModal();
      router.push("/");
    } catch (error) {
      console.error("Error al registrar cliente:", error);
      toast.error("Error en el registro", {
        description: mensajeErrorAuth(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Portal Techsmart
              </h3>
              <p className="text-[11px] text-slate-500">
                {authTab === "login"
                  ? "Accede a tu cuenta para cotizar con precios preferenciales"
                  : "Crea tu cuenta corporativa o particular"}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-slate-100 text-xs mt-3">
          <button
            type="button"
            onClick={() => setAuthTab("login")}
            className={`flex-1 py-2 font-bold transition border-b-2 cursor-pointer ${
              authTab === "login"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => setAuthTab("register")}
            className={`flex-1 py-2 font-bold transition border-b-2 cursor-pointer ${
              authTab === "register"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Registrarse
          </button>
        </div>

        {authTab === "login" ? (
          /* FORMULARIO LOGIN */
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
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
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
                  type={showLoginPass ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-blue-500/10"
            >
              {isSubmitting ? "Verificando credenciales..." : "Iniciar Sesión"}
            </button>
          </form>
        ) : (
          /* FORMULARIO REGISTRO */
          <form onSubmit={handleRegister} className="mt-3.5 space-y-3">
            {/* Selector de cuenta */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Tipo de Cuenta:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTipoCuenta("empresarial")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    tipoCuenta === "empresarial"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Empresarial</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoCuenta("personal")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    tipoCuenta === "personal"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Personal</span>
                </button>
              </div>
            </div>

            {/* Campos condicionales */}
            {tipoCuenta === "empresarial" ? (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Razón Social / Nombre de la Empresa:
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Soluciones Digitales S.A. de C.V."
                      value={regEmpresa}
                      onChange={(e) => setRegEmpresa(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      NIT / NRC (Fiscal):
                    </label>
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="0614-280392-102-1"
                        value={regNit}
                        onChange={(e) => setRegNit(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Contacto Comercial:
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Carlos Morales"
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Nombre Completo:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Carlos Pérez"
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    DUI (Sólo números, 9 dígitos):
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="01234567-8"
                      value={regDui}
                      onChange={handleDuiChange}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Celular */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Número de Celular / WhatsApp:
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+503 7123-4567"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {tipoCuenta === "empresarial" ? "Correo Corporativo:" : "Correo Electrónico Personal:"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder={tipoCuenta === "empresarial" ? "compras@tuempresa.com" : "usuario@gmail.com"}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Contraseña y Confirmar Contraseña */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Mín. 6 carac."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showRegPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Confirmar:
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Repita pass"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {isSubmitting
                ? "Registrando..."
                : tipoCuenta === "empresarial"
                ? "Crear Cuenta Empresarial & Activar Cupo"
                : "Crear Cuenta Personal & Cotizar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

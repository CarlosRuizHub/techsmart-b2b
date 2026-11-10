"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  XCircle,
  History,
} from "lucide-react";
import { toast } from "sonner";
import {
  verificarCodigoPassword,
  confirmarNuevaPassword,
  mensajeErrorAuth,
} from "@/src/lib/firebaseService";

function FormularioRestablecer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Token de seguridad emitido por Firebase en la URL
  const codigo = searchParams.get("oobCode");

  const [correoUsuario, setCorreoUsuario] = useState<string | null>(null);
  const [verificandoCodigo, setVerificandoCodigo] = useState(true);
  const [codigoValido, setCodigoValido] = useState(false);

  // Campos de contraseña
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  // Validar código de un solo uso al montar el componente
  useEffect(() => {
    let activo = true;

    async function validar() {
      if (!codigo) {
        setVerificandoCodigo(false);
        setCodigoValido(false);
        return;
      }

      try {
        const correo = await verificarCodigoPassword(codigo);
        if (activo) {
          setCorreoUsuario(correo);
          setCodigoValido(true);
        }
      } catch (err) {
        console.error("Código de recuperación no válido:", err);
        if (activo) {
          setCodigoValido(false);
        }
      } finally {
        if (activo) setVerificandoCodigo(false);
      }
    }

    validar();

    return () => {
      activo = false;
    };
  }, [codigo]);

  // Validaciones en tiempo real
  const tieneLongitudMinima = nuevaPassword.length >= 6;
  const passwordsCoinciden =
    nuevaPassword.length > 0 &&
    confirmarPassword.length > 0 &&
    nuevaPassword === confirmarPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tieneLongitudMinima) {
      toast.warning("Contraseña muy corta", {
        description: "La nueva contraseña debe contener al menos 6 caracteres.",
      });
      return;
    }

    if (!passwordsCoinciden) {
      toast.error("Las contraseñas no coinciden", {
        description: "Asegúrate de escribir exactamente la misma clave en ambos campos.",
      });
      return;
    }

    if (!codigo) return;

    setGuardando(true);
    const toastId = toast.loading("Actualizando contraseña en el servidor seguro...");

    try {
      await confirmarNuevaPassword(codigo, nuevaPassword);
      toast.dismiss(toastId);
      toast.success("¡Contraseña actualizada con éxito!", {
        description: "Tu clave ha sido modificada. Ahora puedes ingresar a tu cuenta.",
        duration: 5000,
      });
      setExito(true);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("No se pudo cambiar la contraseña", {
        description: mensajeErrorAuth(err),
      });
    } finally {
      setGuardando(false);
    }
  };

  if (verificandoCodigo) {
    return (
      <div className="text-center py-16 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-xs text-slate-500 font-medium">
          Verificando enlace de seguridad de Techsmart...
        </p>
      </div>
    );
  }

  if (!codigoValido) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Enlace inválido o expirado
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Este enlace de recuperación ya fue utilizado o caducó por motivos de seguridad. Solicita uno nuevo para continuar.
          </p>
        </div>
        <Link
          href="/?auth=login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-500/20"
        >
          <span>Solicitar nuevo enlace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            ¡Contraseña Guardada Exitosamente!
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Tu nueva clave para la cuenta <strong>{correoUsuario}</strong> ha sido registrada en el servidor seguro.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/?auth=login")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-500/20"
        >
          <span>Iniciar Sesión Ahora</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Indicador de cuenta */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Cuenta de acceso:
          </span>
          <span className="font-semibold text-slate-800 truncate block">
            {correoUsuario}
          </span>
        </div>
        <span className="shrink-0 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
          Enlace verificado
        </span>
      </div>

      {/* 1. Nueva contraseña */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">
          Nueva Contraseña:
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type={mostrarNueva ? "text" : "password"}
            required
            minLength={6}
            placeholder="••••••••"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="button"
            onClick={() => setMostrarNueva(!mostrarNueva)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {mostrarNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Confirmar / Repetir contraseña */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 block mb-1">
          Repetir Nueva Contraseña:
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type={mostrarConfirmar ? "text" : "password"}
            required
            minLength={6}
            placeholder="••••••••"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none transition ${
              confirmarPassword && !passwordsCoinciden
                ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                : passwordsCoinciden
                ? "border-emerald-500 focus:border-emerald-600"
                : "border-slate-200 focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {mostrarConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Directivas de seguridad y validación */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
        <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider mb-1">
          Directivas de seguridad:
        </span>

        <div className="flex items-center gap-2">
          {tieneLongitudMinima ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className={tieneLongitudMinima ? "text-emerald-700 font-medium" : "text-slate-500"}>
            Mínimo 6 caracteres
          </span>
        </div>

        <div className="flex items-center gap-2">
          {passwordsCoinciden ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className={passwordsCoinciden ? "text-emerald-700 font-medium" : "text-slate-500"}>
            Las contraseñas coinciden
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-amber-800">
          <History className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>No se permite</strong> reutilizar contraseñas ocupadas previamente en el portal.
          </span>
        </div>
      </div>

      {/* Botón de confirmación */}
      <button
        type="submit"
        disabled={!tieneLongitudMinima || !passwordsCoinciden || guardando}
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-4"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{guardando ? "Guardando cambios..." : "Confirmar y Guardar Contraseña"}</span>
      </button>
    </form>
  );
}

export default function RestablecerPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95">
        {/* Cabecera corporativa idéntica al Navbar */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base leading-tight">
              Techsmart
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Tu mejor aliado B2B • Seguridad
            </span>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="py-12 text-center">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto" />
            </div>
          }
        >
          <FormularioRestablecer />
        </Suspense>
      </div>
    </main>
  );
}
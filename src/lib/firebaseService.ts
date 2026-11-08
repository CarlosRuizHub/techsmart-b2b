// src/lib/firebaseService.ts
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  query,
  serverTimestamp,
  doc,
  setDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { db, storage, auth } from "./firebase";
import { Producto, Cotizacion, TicketRMA, Usuario } from "./types";
import { SAMPLE_PRODUCTOS } from "./sampleData";

const STORAGE_KEYS = {
  COTIZACIONES: "techsmart_cotizaciones_local",
  RMA: "techsmart_rma_local",
  CART: "techsmart_cart_items",
};

// ================= UTILIDADES DE SESIÓN Y RESPALDO LOCAL =================

// Devuelve el correo (en minúsculas) de la sesión activa, o null si no hay sesión.
// Espera a que Firebase termine de restaurar la sesión guardada al cargar la página.
async function correoDeSesion(): Promise<string | null> {
  await auth.authStateReady();
  return auth.currentUser?.email?.toLowerCase() ?? null;
}

// Errores que NO deben esconderse con un respaldo local: significan que falta
// sesión o permiso, y el usuario debe enterarse de que no se guardó.
function esErrorDePermisos(err: unknown): boolean {
  return (
    err instanceof FirebaseError &&
    (err.code === "permission-denied" || err.code === "unauthenticated")
  );
}

// El respaldo local se guarda por usuario para que dos cuentas
// en el mismo navegador no vean los datos de la otra.
function leerLocal<T>(claveBase: string, correo: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${claveBase}_${correo}`);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function guardarLocal<T>(claveBase: string, correo: string, lista: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${claveBase}_${correo}`, JSON.stringify(lista));
  } catch {
    // ignore
  }
}

// Orden del más reciente al más antiguo usando createdAt (evita pedir un índice compuesto)
function marcaDeTiempo(data: DocumentData): number {
  const c = data.createdAt;
  return c && typeof c.toMillis === "function" ? c.toMillis() : 0;
}

// ================= PRODUCTOS =================
export async function getProductos(): Promise<Producto[]> {
  try {
    const colRef = collection(db, "productos");
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return SAMPLE_PRODUCTOS;
    }

    const lista: Producto[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const basePrice =
        typeof data.precio === "number"
          ? data.precio
          : parseFloat(data.precio) || 99.0;
      lista.push({
        id: docSnap.id,
        nombre: data.nombre || "Producto Techsmart B2B",
        sku: data.sku || `TS-${docSnap.id.slice(0, 6).toUpperCase()}`,
        categoria: data.categoria || "Discos & SSD",
        descripcionCorta:
          data.descripcionCorta ||
          data.descripcion ||
          "Componente con garantía oficial Techsmart B2B.",
        descripcionLarga: data.descripcionLarga || data.descripcionCorta || "",
        precio: basePrice,
        precioVolumen: data.precioVolumen || [
          { minQty: 1, price: basePrice, discountLabel: "Precio Unitario" },
          {
            minQty: 5,
            price: Number((basePrice * 0.95).toFixed(2)),
            discountLabel: "Ahorro 5% (5+ uds)",
          },
          {
            minQty: 15,
            price: Number((basePrice * 0.9).toFixed(2)),
            discountLabel: "Ahorro 10% (15+ uds)",
          },
        ],
        stock: typeof data.stock === "number" ? data.stock : 25,
        disponibilidad: data.disponibilidad || "inmediato",
        bodega: data.bodega || "Bodega Central (San Salvador)",
        garantiaMeses: data.garantiaMeses || 24,
        imagen:
          data.imagen ||
          "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
        specs: data.specs || [
          { label: "Garantía Mayorista", value: "24 Meses Oficial" },
          { label: "Condición", value: "Nuevo Sellado B2B" },
          { label: "Disponibilidad", value: "Bodega Central" },
        ],
        destacado: data.destacado ?? true,
      });
    });

    return lista.length > 0 ? lista : SAMPLE_PRODUCTOS;
  } catch (err) {
    console.warn(
      "Firestore offline o no configurado aún, cargando datos locales:",
      err,
    );
    return SAMPLE_PRODUCTOS;
  }
}

// Inicializar catálogo en Firestore si está vacío.
// OJO: con las reglas de seguridad nuevas el cliente ya no puede escribir en "productos";
// la carga inicial debe hacerse con el script de sembrado (Admin SDK) o desde la consola.
export async function seedProductosEnFirestore(): Promise<void> {
  try {
    const colRef = collection(db, "productos");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      for (const prod of SAMPLE_PRODUCTOS) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...data } = prod;
        await addDoc(colRef, {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.warn("No se pudo sembrar en Firestore:", err);
  }
}

// ================= COTIZACIONES =================
// Cada cotización pertenece a la cuenta que la creó (campo "usuarioCorreo").
// El campo "correo" sigue siendo el correo de contacto escrito en el formulario.

// Devuelve solo las cotizaciones del usuario con sesión iniciada
export async function getCotizaciones(): Promise<Cotizacion[]> {
  const usuarioCorreo = await correoDeSesion();
  if (!usuarioCorreo) return [];

  try {
    const q = query(
      collection(db, "cotizaciones"),
      where("usuarioCorreo", "==", usuarioCorreo),
    );
    const snapshot = await getDocs(q);

    const lista = [...snapshot.docs]
      .sort((a, b) => marcaDeTiempo(b.data()) - marcaDeTiempo(a.data()))
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Cotizacion);

    guardarLocal(STORAGE_KEYS.COTIZACIONES, usuarioCorreo, lista);
    return lista;
  } catch (err) {
    if (esErrorDePermisos(err)) {
      console.error("Sin permiso para leer cotizaciones:", err);
      return [];
    }
    console.warn(
      "Error obteniendo cotizaciones de Firestore, usando respaldo local:",
      err,
    );
    return leerLocal<Cotizacion>(STORAGE_KEYS.COTIZACIONES, usuarioCorreo);
  }
}

export async function guardarCotizacion(
  cotizacion: Omit<Cotizacion, "id">,
): Promise<Cotizacion> {
  const usuarioCorreo = await correoDeSesion();
  if (!usuarioCorreo) {
    throw new Error("Debes iniciar sesión para guardar una cotización.");
  }

  // El propietario siempre es la cuenta con sesión, sin importar lo que llegue del formulario
  const datos = { ...cotizacion, usuarioCorreo };

  try {
    const docRef = await addDoc(collection(db, "cotizaciones"), {
      ...datos,
      createdAt: serverTimestamp(),
    });
    const nuevaCotizacion: Cotizacion = { id: docRef.id, ...datos };

    const actuales = leerLocal<Cotizacion>(
      STORAGE_KEYS.COTIZACIONES,
      usuarioCorreo,
    );
    guardarLocal(STORAGE_KEYS.COTIZACIONES, usuarioCorreo, [
      nuevaCotizacion,
      ...actuales.filter((c) => c.id !== docRef.id),
    ]);

    return nuevaCotizacion;
  } catch (err) {
    // Sin sesión o sin permiso: no se esconde con un respaldo local
    if (esErrorDePermisos(err)) throw err;

    console.warn(
      "Firestore error guardando cotización, guardando en local storage:",
      err,
    );
    const nuevaCotizacion: Cotizacion = {
      ...datos,
      id: `local-cot-${Date.now()}`,
    };
    const actuales = leerLocal<Cotizacion>(
      STORAGE_KEYS.COTIZACIONES,
      usuarioCorreo,
    );
    guardarLocal(STORAGE_KEYS.COTIZACIONES, usuarioCorreo, [
      nuevaCotizacion,
      ...actuales,
    ]);
    return nuevaCotizacion;
  }
}

// ================= TICKETS RMA =================
// Igual que las cotizaciones: cada ticket pertenece a la cuenta que lo creó.

// Devuelve solo los tickets del usuario con sesión iniciada
export async function getTicketsRMA(): Promise<TicketRMA[]> {
  const usuarioCorreo = await correoDeSesion();
  if (!usuarioCorreo) return [];

  try {
    const q = query(
      collection(db, "rma_tickets"),
      where("usuarioCorreo", "==", usuarioCorreo),
    );
    const snapshot = await getDocs(q);

    const lista = [...snapshot.docs]
      .sort((a, b) => marcaDeTiempo(b.data()) - marcaDeTiempo(a.data()))
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as TicketRMA);

    guardarLocal(STORAGE_KEYS.RMA, usuarioCorreo, lista);
    return lista;
  } catch (err) {
    if (esErrorDePermisos(err)) {
      console.error("Sin permiso para leer tickets RMA:", err);
      return [];
    }
    console.warn("Error leyendo RMA de Firestore, usando respaldo local:", err);
    return leerLocal<TicketRMA>(STORAGE_KEYS.RMA, usuarioCorreo);
  }
}

export async function crearTicketRMA(
  ticket: Omit<TicketRMA, "id">,
): Promise<TicketRMA> {
  const usuarioCorreo = await correoDeSesion();
  if (!usuarioCorreo) {
    throw new Error("Debes iniciar sesión para crear un reclamo.");
  }

  const datos = { ...ticket, usuarioCorreo };

  try {
    const docRef = await addDoc(collection(db, "rma_tickets"), {
      ...datos,
      createdAt: serverTimestamp(),
    });
    const nuevoTicket: TicketRMA = { id: docRef.id, ...datos };

    const actuales = leerLocal<TicketRMA>(STORAGE_KEYS.RMA, usuarioCorreo);
    guardarLocal(STORAGE_KEYS.RMA, usuarioCorreo, [
      nuevoTicket,
      ...actuales.filter((t) => t.id !== docRef.id),
    ]);

    return nuevoTicket;
  } catch (err) {
    if (esErrorDePermisos(err)) throw err;

    console.warn("Error en Firestore para RMA, guardando local:", err);
    const nuevoTicket: TicketRMA = {
      ...datos,
      id: `local-rma-${Date.now()}`,
    };
    const actuales = leerLocal<TicketRMA>(STORAGE_KEYS.RMA, usuarioCorreo);
    guardarLocal(STORAGE_KEYS.RMA, usuarioCorreo, [nuevoTicket, ...actuales]);
    return nuevoTicket;
  }
}

// ================= SUBIDA DE ARCHIVOS A FIREBASE STORAGE =================
export async function subirArchivoAdjunto(
  file: File,
  folder: "rfq" | "rma" = "rfq",
): Promise<string> {
  try {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    // Sin sesión o sin permiso: una URL local simulada no le serviría a nadie
    if (
      err instanceof FirebaseError &&
      (err.code === "storage/unauthorized" ||
        err.code === "storage/unauthenticated")
    ) {
      throw err;
    }
    console.warn("Firebase storage error, generando URL local simulada:", err);
    return URL.createObjectURL(file);
  }
}

// ================= AUTENTICACIÓN Y USUARIOS =================
// Las cuentas viven en Firebase Authentication (compartidas con la app móvil).
// El perfil del cliente se guarda en Firestore, colección "usuarios",
// con el correo normalizado como ID del documento.

// Traduce los errores de Firebase Auth a mensajes para el usuario
export function mensajeErrorAuth(err: unknown): string {
  const code = err instanceof FirebaseError ? err.code : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Este correo ya está registrado.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Inténtalo de nuevo más tarde.";
    case "auth/network-request-failed":
      return "Sin conexión a internet.";
    default:
      return "Ocurrió un error. Inténtalo de nuevo.";
  }
}

function fechaRegistroActual(): string {
  return new Date().toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Firestore rechaza valores undefined (por ejemplo razonSocial en cuentas personales)
function sinUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

// Línea de crédito inicial según el tipo de cuenta.
// Las reglas de Firestore validan estos mismos valores: si cambian aquí, hay que cambiarlos allá.
export const LINEA_CREDITO_INICIAL = {
  empresarial: 25000,
  personal: 3500,
} as const;

// Registra al cliente: crea la cuenta en Authentication y su perfil en Firestore
export async function registrarUsuario(
  datos: Omit<
    Usuario,
    "id" | "rol" | "estado" | "fechaRegistro" | "origen" | "lineaCredito"
  > & {
    password: string;
  },
): Promise<Usuario> {
  const correoNormalizado = datos.correo.trim().toLowerCase();

  // Se separa password para que bajo ninguna circunstancia se guarde en Firestore
  const { password, ...restoDatos } = datos;

  // 1. Cuenta en Firebase Authentication (la contraseña la gestiona Firebase)
  await createUserWithEmailAndPassword(auth, correoNormalizado, password);

  // 2. Perfil en Firestore
  const nuevoUsuario: Usuario = sinUndefined({
    ...restoDatos,
    correo: correoNormalizado,
    rol: "cliente_b2b" as const,
    lineaCredito: LINEA_CREDITO_INICIAL[datos.tipoCuenta],
    estado: "activo" as const,
    fechaRegistro: fechaRegistroActual(),
    origen: "web" as const,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "usuarios", correoNormalizado), nuevoUsuario);
  return { id: correoNormalizado, ...nuevoUsuario };
}

// Inicio de sesión: valida con Firebase Auth y devuelve el perfil del cliente
export async function iniciarSesion(
  correo: string,
  password: string,
): Promise<Usuario> {
  const correoNormalizado = correo.trim().toLowerCase();
  const credencial = await signInWithEmailAndPassword(
    auth,
    correoNormalizado,
    password,
  );

  const docRef = doc(db, "usuarios", correoNormalizado);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return { id: snap.id, ...(snap.data() as Omit<Usuario, "id">) };
  }

  // La cuenta existe en Authentication pero no tiene perfil en Firestore
  // (por ejemplo, si falló el guardado durante el registro): se crea uno básico.
  const perfilBasico: Usuario = {
    tipoCuenta: "personal",
    nombreContacto: credencial.user.displayName ?? "",
    telefono: "",
    correo: correoNormalizado,
    rol: "cliente_b2b",
    lineaCredito: LINEA_CREDITO_INICIAL.personal,
    estado: "activo",
    fechaRegistro: fechaRegistroActual(),
    origen: "web",
    createdAt: serverTimestamp(),
  };
  await setDoc(docRef, perfilBasico);
  return { id: correoNormalizado, ...perfilBasico };
}

export async function cerrarSesion(): Promise<void> {
  await signOut(auth);
}

export async function enviarRecuperacionPassword(correo: string): Promise<void> {
  await sendPasswordResetEmail(auth, correo.trim().toLowerCase());
}

// Para escuchar cambios de sesión (por ejemplo desde un contexto de React)
export function observarSesion(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Búsqueda de perfil de cliente por correo
export async function obtenerUsuarioPorCorreo(
  correo: string,
): Promise<Usuario | null> {
  try {
    const idNormalizado = correo.trim().toLowerCase();
    const q = query(
      collection(db, "usuarios"),
      where("correo", "==", idNormalizado),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...(docSnap.data() as Omit<Usuario, "id">),
    };
  } catch (error) {
    console.error("Error al consultar cliente:", error);
    return null;
  }
}
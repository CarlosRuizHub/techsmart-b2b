// src/lib/firebaseService.ts
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { Producto, Cotizacion, TicketRMA } from "./types";
import { SAMPLE_PRODUCTOS, SAMPLE_COTIZACIONES, SAMPLE_TICKETS_RMA } from "./sampleData";

const STORAGE_KEYS = {
  COTIZACIONES: "techsmart_cotizaciones_local",
  RMA: "techsmart_rma_local",
  CART: "techsmart_cart_items",
};

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
      const basePrice = typeof data.precio === "number" ? data.precio : parseFloat(data.precio) || 99.00;
      lista.push({
        id: docSnap.id,
        nombre: data.nombre || "Producto Techsmart B2B",
        sku: data.sku || `TS-${docSnap.id.slice(0, 6).toUpperCase()}`,
        categoria: data.categoria || "Discos & SSD",
        descripcionCorta: data.descripcionCorta || data.descripcion || "Componente con garantía oficial Techsmart B2B.",
        descripcionLarga: data.descripcionLarga || data.descripcionCorta || "",
        precio: basePrice,
        precioVolumen: data.precioVolumen || [
          { minQty: 1, price: basePrice, discountLabel: "Precio Unitario" },
          { minQty: 5, price: Number((basePrice * 0.95).toFixed(2)), discountLabel: "Ahorro 5% (5+ uds)" },
          { minQty: 15, price: Number((basePrice * 0.90).toFixed(2)), discountLabel: "Ahorro 10% (15+ uds)" },
        ],
        stock: typeof data.stock === "number" ? data.stock : 25,
        disponibilidad: data.disponibilidad || "inmediato",
        bodega: data.bodega || "Bodega Central (San Salvador)",
        garantiaMeses: data.garantiaMeses || 24,
        imagen: data.imagen || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
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
    console.warn("Firestore offline o no configurado aún, cargando datos locales:", err);
    return SAMPLE_PRODUCTOS;
  }
}

// Inicializar catálogo en Firestore si está vacío
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
export async function getCotizaciones(): Promise<Cotizacion[]> {
  try {
    const q = query(collection(db, "cotizaciones"), orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem(STORAGE_KEYS.COTIZACIONES);
        if (local) {
          try {
            return JSON.parse(local);
          } catch {
            // ignore
          }
        }
      }
      return SAMPLE_COTIZACIONES;
    }

    const lista: Cotizacion[] = [];
    snapshot.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data() } as Cotizacion);
    });
    return lista;
  } catch (err) {
    console.warn("Error obteniendo cotizaciones de Firestore, usando respaldo:", err);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(STORAGE_KEYS.COTIZACIONES);
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          // ignore
        }
      }
    }
    return SAMPLE_COTIZACIONES;
  }
}

export async function guardarCotizacion(
  cotizacion: Omit<Cotizacion, "id">
): Promise<Cotizacion> {
  try {
    const docRef = await addDoc(collection(db, "cotizaciones"), {
      ...cotizacion,
      createdAt: serverTimestamp(),
    });
    const nuevaCotizacion = { id: docRef.id, ...cotizacion };

    if (typeof window !== "undefined") {
      const current = await getCotizaciones();
      localStorage.setItem(
        STORAGE_KEYS.COTIZACIONES,
        JSON.stringify([nuevaCotizacion, ...current.filter((c) => c.id !== docRef.id)])
      );
    }

    return nuevaCotizacion;
  } catch (err) {
    console.warn("Firestore error guardando cotización, guardando en local storage:", err);
    const nuevaCotizacion = {
      ...cotizacion,
      id: `local-cot-${Date.now()}`,
    };

    if (typeof window !== "undefined") {
      const current = await getCotizaciones();
      localStorage.setItem(
        STORAGE_KEYS.COTIZACIONES,
        JSON.stringify([nuevaCotizacion, ...current])
      );
    }
    return nuevaCotizacion;
  }
}

// ================= TICKETS RMA =================
export async function getTicketsRMA(): Promise<TicketRMA[]> {
  try {
    const q = query(collection(db, "rma_tickets"), orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem(STORAGE_KEYS.RMA);
        if (local) {
          try {
            return JSON.parse(local);
          } catch {
            // ignore
          }
        }
      }
      return SAMPLE_TICKETS_RMA;
    }

    const lista: TicketRMA[] = [];
    snapshot.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data() } as TicketRMA);
    });
    return lista;
  } catch (err) {
    console.warn("Error leyendo RMA de Firestore, usando respaldo:", err);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(STORAGE_KEYS.RMA);
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          // ignore
        }
      }
    }
    return SAMPLE_TICKETS_RMA;
  }
}

export async function crearTicketRMA(
  ticket: Omit<TicketRMA, "id">
): Promise<TicketRMA> {
  try {
    const docRef = await addDoc(collection(db, "rma_tickets"), {
      ...ticket,
      createdAt: serverTimestamp(),
    });
    const nuevoTicket = { id: docRef.id, ...ticket };

    if (typeof window !== "undefined") {
      const current = await getTicketsRMA();
      localStorage.setItem(
        STORAGE_KEYS.RMA,
        JSON.stringify([nuevoTicket, ...current.filter((t) => t.id !== docRef.id)])
      );
    }

    return nuevoTicket;
  } catch (err) {
    console.warn("Error en Firestore para RMA, guardando local:", err);
    const nuevoTicket = {
      ...ticket,
      id: `local-rma-${Date.now()}`,
    };

    if (typeof window !== "undefined") {
      const current = await getTicketsRMA();
      localStorage.setItem(
        STORAGE_KEYS.RMA,
        JSON.stringify([nuevoTicket, ...current])
      );
    }
    return nuevoTicket;
  }
}

// ================= SUBIDA DE ARCHIVOS A FIREBASE STORAGE =================
export async function subirArchivoAdjunto(
  file: File,
  folder: "rfq" | "rma" = "rfq"
): Promise<string> {
  try {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn("Firebase storage error, generando URL local simulada:", err);
    return URL.createObjectURL(file);
  }
}

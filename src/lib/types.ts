// src/lib/types.ts

export interface TechnicalSpec {
  label: string;
  value: string;
}

export interface VolumePrice {
  minQty: number;
  price: number;
  discountLabel: string;
}

export interface Producto {
  id: string;
  nombre: string;
  sku: string;
  categoria: string;
  descripcionCorta: string;
  descripcionLarga?: string;
  precio: number;
  precioVolumen?: { minQty: number; price: number; discountLabel: string }[];
  stock: number;
  disponibilidad: "inmediato" | "bajo_pedido";
  bodega: string;
  garantiaMeses: number;
  imagen: string;
  imagenes?: string[];
  specs: { label: string; value: string }[];
  destacado?: boolean;
}

export interface ItemCotizacion {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  nota?: string;
}

export interface Cotizacion {
  id: string;
  folio: string; // e.g. "COT-8492"
  fecha: string;
  vencimiento: string;
  estado:
    | "En Revisión"
    | "Aprobada"
    | "Pendiente de Pago"
    | "Despachada"
    | "Cancelada";
  tipoCliente: "Empresa / Corporativo" | "Cliente Particular";
  razonSocial: string;
  nit: string;
  contacto: string;
  telefono: string;
  correo: string;
  tiempoEntrega: "Inmediato (24h)" | "24 - 72 hrs" | "Bajo Pedido (7-15d)";
  validezDias: number;
  items: ItemCotizacion[];
  subtotalNeto: number;
  descuento: number;
  iva: number;
  total: number;
  notas?: string;
  archivoAdjuntoUrl?: string;
}

export type RMAEstado =
  | "Reportado"
  | "Recibido en Bodega"
  | "En Diagnóstico Técnico"
  | "Cambio Aprobado"
  | "Cerrado";

export interface TicketRMA {
  id: string;
  folio: string; // e.g. "RMA-2026-0812"
  fecha: string;
  estado: RMAEstado;
  productoNombre: string;
  sku: string;
  numeroSerie: string;
  facturaReferencia: string;
  cliente: string;
  contacto: string;
  telefono: string;
  correo: string;
  descripcionFalla: string;
  esDOA: boolean; // Dead on arrival (primeros 7 días)
  diagnosticoTecnico?: string;
  resolucion?: string;
}

// El perfil se guarda en Firestore (colección "usuarios", ID = correo en minúsculas).
// La contraseña la gestiona Firebase Authentication: ya NO se guarda aquí.
export interface Usuario {
  id?: string;
  tipoCuenta: "empresarial" | "personal";
  razonSocial?: string;
  nit?: string;
  nombreContacto: string;
  telefono: string;
  correo: string;
  rol: "cliente_b2b";
  lineaCredito: number; // Cupo inicial según tipo de cuenta (empresarial 25000, personal 3500); solo un administrador puede cambiarlo
  estado: "activo";
  fechaRegistro: string;
  origen?: "app" | "web"; // Desde dónde se registró el usuario
  createdAt?: unknown; // Timestamp de Firestore (serverTimestamp)
}

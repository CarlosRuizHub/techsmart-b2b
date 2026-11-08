"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { ItemCotizacion, Producto, Usuario } from "./types";
import {
  observarSesion,
  cerrarSesion,
  obtenerUsuarioPorCorreo,
} from "./firebaseService";

interface CartContextType {
  items: ItemCotizacion[];
  addItem: (producto: Producto, cantidad?: number, nota?: string) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotalNeto: number;
  descuentoTotal: number;
  ivaEstimado: number;
  totalEstimado: number;
  lineaCreditoDisponible: number;
  // Modal de Pago / Checkout
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  // Modal y Estado de Autenticación Global
  currentUser: Usuario | null;
  isAuthOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (user: Usuario) => void;
  logout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_CART = "techsmart_cart_v1";
const LOCAL_STORAGE_USER = "techsmart_active_user";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCotizacion[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  
  // Producto pendiente de cotizar tras autenticarse
  const [pendingItem, setPendingItem] = useState<{
    producto: Producto;
    cantidad: number;
    nota: string;
  } | null>(null);

  const isMounted = useRef(false);
  const lineaCreditoDisponible = currentUser?.lineaCredito ?? 25000.0;

  // 1. Cargar carrito y usuario desde localStorage (para mostrar la interfaz al instante)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(LOCAL_STORAGE_CART);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        requestAnimationFrame(() => setItems(parsed));
      }

      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        requestAnimationFrame(() => setCurrentUser(parsedUser));
      }
    } catch (e) {
      console.error("Error cargando datos de sesión:", e);
    }
  }, []);

  // 1b. Sincronizar con Firebase Authentication, que es la fuente de verdad de la sesión.
  // Si Firebase no tiene sesión, se descarta cualquier usuario guardado en localStorage.
  useEffect(() => {
    const cancelarSuscripcion = observarSesion(async (firebaseUser) => {
      if (!firebaseUser?.email) {
        setCurrentUser(null);
        try {
          localStorage.removeItem(LOCAL_STORAGE_USER);
        } catch {
          // ignore
        }
        return;
      }

      // Se carga el perfil actualizado. Si todavía no existe (por ejemplo, justo al
      // registrarse), no se hace nada: login() lo establecerá cuando termine el registro.
      const perfil = await obtenerUsuarioPorCorreo(firebaseUser.email);
      if (perfil) {
        setCurrentUser(perfil);
        try {
          localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(perfil));
        } catch {
          // ignore
        }
      }
    });

    return cancelarSuscripcion;
  }, []);

  // 2. Persistir carrito ante cambios
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(items));
    } catch (e) {
      console.error("Error guardando carrito:", e);
    }
  }, [items]);

  // Controles de modales
  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openAuthModal = () => setIsAuthOpen(true);
  const closeAuthModal = () => {
    setIsAuthOpen(false);
    setPendingItem(null);
  };

  // Lógica interna para insertar el producto al carrito
  const executeAddItem = (producto: Producto, cantidad = 1, nota = "") => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.producto.id === producto.id);
      let precioUnitario = producto.precio;
      const targetQty =
        existingIndex > -1 ? prev[existingIndex].cantidad + cantidad : cantidad;

      if (producto.precioVolumen && producto.precioVolumen.length > 0) {
        const sortedTiers = [...producto.precioVolumen].sort(
          (a, b) => b.minQty - a.minQty
        );
        const matchTier = sortedTiers.find((t) => targetQty >= t.minQty);
        if (matchTier) {
          precioUnitario = matchTier.price;
        }
      }

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: targetQty,
          precioUnitario,
          nota: nota || updated[existingIndex].nota,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            producto,
            cantidad: targetQty,
            precioUnitario,
            nota,
          },
        ];
      }
    });
  };

  // Interceptor: valida sesión antes de agregar a la cotización
  const addItem = (producto: Producto, cantidad = 1, nota = "") => {
    if (!currentUser) {
      setPendingItem({ producto, cantidad, nota });
      setIsAuthOpen(true);
      return;
    }
    executeAddItem(producto, cantidad, nota);
  };

  // Iniciar sesión y procesar producto pendiente
  const login = (user: Usuario) => {
    setCurrentUser(user);
    localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(user));
    setIsAuthOpen(false);

    if (pendingItem) {
      executeAddItem(pendingItem.producto, pendingItem.cantidad, pendingItem.nota);
      setPendingItem(null);
    }
  };

  // Cerrar sesión: cierra también la sesión de Firebase y vacía la cotización en curso
  // para que no pase a la siguiente persona que use este navegador.
  const logout = () => {
    cerrarSesion().catch((e) => console.error("Error cerrando sesión:", e));
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER);
    setItems([]);
    setIsAuthOpen(false);
  };

  const removeItem = (productoId: string) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  };

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.producto.id !== productoId) return item;

        let unitPrice = item.producto.precio;
        if (
          item.producto.precioVolumen &&
          item.producto.precioVolumen.length > 0
        ) {
          const sortedTiers = [...item.producto.precioVolumen].sort(
            (a, b) => b.minQty - a.minQty
          );
          const matchTier = sortedTiers.find((t) => cantidad >= t.minQty);
          if (matchTier) {
            unitPrice = matchTier.price;
          }
        }

        return {
          ...item,
          cantidad,
          precioUnitario: unitPrice,
        };
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItemsCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  const subtotalBase = items.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0
  );

  const subtotalNeto = items.reduce(
    (sum, item) => sum + item.precioUnitario * item.cantidad,
    0
  );

  const descuentoTotal = Math.max(0, subtotalBase - subtotalNeto);
  const ivaEstimado = subtotalNeto * 0.13;
  const totalEstimado = subtotalNeto + ivaEstimado;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotalNeto,
        descuentoTotal,
        ivaEstimado,
        totalEstimado,
        lineaCreditoDisponible,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        currentUser,
        isAuthOpen,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe utilizarse dentro de un CartProvider");
  }
  return context;
}

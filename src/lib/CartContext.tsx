"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ItemCotizacion, Producto } from "./types";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_CART = "techsmart_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCotizacion[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_CART);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
    return [];
  });

  const lineaCreditoDisponible = 45000.0; // Línea de crédito B2B asignada

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(items));
    } catch (e) {
      console.error("Error saving cart:", e);
    }
  }, [items]);

  const addItem = (producto: Producto, cantidad = 1, nota = "") => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.producto.id === producto.id
      );

      // Calcular precio unitario por volumen si aplica
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

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  // Subtotal base sin descuentos
  const subtotalBase = items.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0
  );

  // Subtotal con precios por volumen aplicados
  const subtotalNeto = items.reduce(
    (sum, item) => sum + item.precioUnitario * item.cantidad,
    0
  );

  // Descuento ganado por volumen
  const descuentoTotal = Math.max(0, subtotalBase - subtotalNeto);

  // IVA El Salvador 13%
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

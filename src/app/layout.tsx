import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { CartProvider } from "../lib/CartContext";
import CheckoutModal from "./components/CheckoutModal";
import AuthModal from "./components/AuthModal";
import WhatsAppWidget from "./components/WhatsAppWidget"; // <-- 1. Importar el Widget
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Techsmart B2B | Distribuidor Mayorista de Tecnología & Hardware",
  description:
    "Portal oficial de Techsmart B2B El Salvador. Catálogo mayorista, cotizador express con cálculo de IVA y gestión de garantías RMA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <CartProvider>
          <Toaster richColors position="top-right" closeButton />

          <div className="print:hidden">
            <Navbar />
          </div>

          <div className="flex-1 flex flex-col">{children}</div>

          <footer className="print:hidden bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
            {/* Contenido del footer */}
          </footer>

          <div className="print:hidden">
            <CheckoutModal />
            <AuthModal />
          </div>

          {/* 2. Widget de WhatsApp Flotante */}
          <WhatsAppWidget />
        </CartProvider>
      </body>
    </html>
  );
}
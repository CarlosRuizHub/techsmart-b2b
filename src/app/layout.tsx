import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { CartProvider } from "../lib/CartContext";

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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        <CartProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>© 2026 Techsmart B2B El Salvador. Todos los derechos reservados.</p>
              <div className="flex items-center space-x-6 text-slate-400">
                <span>Bodega Central: San Salvador, C.A.</span>
                <span>PBX: +503 2200-8800</span>
                <span>soporte@techsmart.sv</span>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

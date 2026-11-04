"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Grid,
  List,
  ArrowUpDown,
  Database,
  ChevronRight,
  Loader2,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import QuotationSidebar from "../components/QuotationSidebar";
import { Producto } from "@/src/lib/types";
import { getProductos, seedProductosEnFirestore } from "@/src/lib/firebaseService";
import { SAMPLE_PRODUCTOS } from "@/src/lib/sampleData";

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>(SAMPLE_PRODUCTOS);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<"populares" | "precio-asc" | "precio-desc" | "nombre">("populares");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getProductos();
        setProductos(data);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    if (seedProductosEnFirestore) {
      await seedProductosEnFirestore();
    }
    const data = await getProductos();
    setProductos(data);
    setSeeding(false);
  };

  const categories = [
    { id: "Todos", label: "Todos", count: productos.length },
    {
      id: "RAM & Flash",
      label: "RAM & Flash",
      count: productos.filter((p) => p.categoria === "RAM & Flash").length,
    },
    {
      id: "Discos & SSD",
      label: "Discos & SSD",
      count: productos.filter((p) => p.categoria === "Discos & SSD").length,
    },
    {
      id: "CPUs & Procesadores",
      label: "CPUs & Procesadores",
      count: productos.filter((p) => p.categoria === "CPUs & Procesadores").length,
    },
    {
      id: "Servidores & Redes",
      label: "Servidores & Redes",
      count: productos.filter((p) => p.categoria === "Servidores & Redes").length,
    },
    {
      id: "Licenciamiento & OS",
      label: "Licenciamiento & OS",
      count: productos.filter((p) => p.categoria === "Licenciamiento & OS").length,
    },
  ];

  const filteredProducts = useMemo(() => {
    return productos
      .filter((p) => {
        const matchesCategory =
          selectedCategory === "Todos" || p.categoria === selectedCategory;
        const matchesQuery =
          p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.descripcionCorta.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStock = !onlyInStock || p.stock > 0;
        return matchesCategory && matchesQuery && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "precio-asc") return a.precio - b.precio;
        if (sortBy === "precio-desc") return b.precio - a.precio;
        if (sortBy === "nombre") return a.nombre.localeCompare(b.nombre);
        return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0);
      });
  }, [productos, selectedCategory, searchQuery, onlyInStock, sortBy]);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>Techsmart Portal</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-blue-600 font-medium">Catálogo Mayorista Directo</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Catálogo Directo de Componentes & Soluciones B2B
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Precios preferenciales para integradores certificados, subdistribuidores y corporativos.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold transition"
                title="Sincronizar catálogo con Firestore"
              >
                <Database className={`w-3.5 h-3.5 ${seeding ? "animate-spin text-blue-600" : "text-slate-500"}`} />
                <span>{seeding ? "Sincronizando..." : "Sincronizar con Firestore"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="space-y-4 mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por modelo, PN, descripción o marca (Kingston, Intel, ASUS, etc.)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Solo con stock inmediato</span>
              </label>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "populares" | "precio-asc" | "precio-desc" | "nombre"
                    )
                  }
                  className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="populares">Más Populares</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                  <option value="nombre">Nombre A - Z</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white text-blue-600 shadow-xs" : "text-slate-400 hover:text-slate-700"}`}
                  title="Vista en Cuadrícula"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "bg-white text-blue-600 shadow-xs" : "text-slate-400 hover:text-slate-700"}`}
                  title="Vista en Lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? "bg-blue-700 text-blue-100" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                Mostrando <strong className="text-slate-800">{filteredProducts.length}</strong> de{" "}
                {productos.length} productos disponibles
              </span>
              {selectedCategory !== "Todos" && (
                <button
                  onClick={() => setSelectedCategory("Todos")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No se encontraron productos</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Intenta cambiar el término de búsqueda o selecciona otra categoría.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Todos");
                    setOnlyInStock(false);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    producto={prod}
                    onOpenModal={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg p-1 shrink-0">
                        <Image
                          src={prod.imagen}
                          alt={prod.nombre}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {prod.categoria}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {prod.sku}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                          {prod.nombre}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {prod.descripcionCorta}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-500 block">Precio B2B:</span>
                        <span className="text-base font-bold text-slate-900">
                          ${prod.precio.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(prod);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <QuotationSidebar />
          </div>
        </div>
      </div>

      <ProductModal
        producto={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}
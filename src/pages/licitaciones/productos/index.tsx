import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { licitacionesService } from '@/domain/licitaciones/services/licitacionesService';
import { LicitacionProduct } from '@/domain/licitaciones/types/licitacion.types';
import {
  Package,
  Search,
  DollarSign,
  Boxes,
  Building,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  SlidersHorizontal,
  Tag,
  X,
  Filter,
} from 'lucide-react';

const CATEGORIES = [
  'todas',
  'Monitoreo',
  'Diagnóstico',
  'Terapia Intensiva',
  'Cardiología',
  'Quirófano',
  'Urgencias',
  'Esterilización',
  'Tecnología',
  'Imagenología',
  'Neonatología',
  'Alta Especialidad',
  'Oncología',
];

export default function LicitacionesProductosPage() {
  const [products, setProducts] = useState<LicitacionProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // Comienza en 1 (skip)
  const [limit] = useState(20); // 20 productos por página
  const [orderBy, setOrderBy] = useState('-stock'); // Por defecto mayor a menor stock
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await licitacionesService.getProducts({
        page,
        limit,
        orderBy,
        search: submittedSearch,
        category: selectedCategory,
      });
      setProducts(data.results);
      setTotal(data.total);
    } finally {
      setIsLoading(false);
    }
  };

  // Recargar al cambiar página, orden, categoría o término de búsqueda confirmado
  useEffect(() => {
    fetchProducts();
  }, [page, orderBy, submittedSearch, selectedCategory]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
    setSubmittedSearch(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSubmittedSearch('');
    setPage(1);
  };

  const handleCategoryChange = (newCat: string) => {
    setSelectedCategory(newCat);
    setPage(1);
  };

  // Alternar orden de stock (Mayor a menor <-> Menor a mayor)
  const handleToggleStockSort = () => {
    setPage(1);
    setOrderBy((prev) => (prev === '-stock' ? 'stock' : '-stock'));
  };

  const handleOrderByChange = (newOrder: string) => {
    setPage(1);
    setOrderBy(newOrder);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const sumCurrentStock = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <DashboardLayout
      title="Catálogo de Productos para Licitaciones"
      allowedRoles={['admin', 'licitaciones', 'licitador']}
      onRefresh={fetchProducts}
      isRefreshing={isLoading}
    >
      <Head>
        <title>Productos e Insumos | Limenka Licitaciones</title>
      </Head>

      <div className="w-full space-y-4">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                Limenka 360 • /products
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Catálogo de Productos e Insumos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Inventario de 20 artículos por página ordenados por stock disponible
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              disabled={isLoading}
              title="Actualizar catálogo de productos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-blue-600 transition-transform ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Resumen KPIs compactos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Registrados
              </span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{total} artículos</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Stock en Página Actual ({products.length} ítems)
              </span>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{sumCurrentStock} unidades</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Filtros Activos
              </span>
              <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                {selectedCategory !== 'todas' ? `${selectedCategory} · ` : ''}
                {orderBy === '-stock' && 'Mayor stock ↓'}
                {orderBy === 'stock' && 'Menor stock ↑'}
                {orderBy === 'name' && 'Nombre A-Z'}
                {orderBy === '-name' && 'Nombre Z-A'}
                {orderBy === '-amount' && 'Mayor precio ↓'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Barra de Filtros: Buscador, Categoría y Selector de Orden */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Buscador con ejecución al presionar Enter o botón */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por código (ej. MED-...) o nombre... (presiona Enter)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  title="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              title="Buscar por código o nombre (Enter)"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span>Buscar</span>
              <span className="text-[10px] bg-blue-500/80 px-1 py-0.5 rounded font-mono leading-none">
                ↵
              </span>
            </button>
          </form>

          {/* Filtro por Categoría y Orden */}
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            {/* Filtro de Categoría */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Categoría:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="todas">Todas las categorías</option>
                {CATEGORIES.filter((c) => c !== 'todas').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Orden */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Orden:
              </span>
              <select
                value={orderBy}
                onChange={(e) => handleOrderByChange(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="-stock">Mayor Stock (Descendente) ↓</option>
                <option value="stock">Menor Stock (Ascendente) ↑</option>
                <option value="name">Nombre (A - Z)</option>
                <option value="-name">Nombre (Z - A)</option>
                <option value="-amount">Mayor Precio ↓</option>
                <option value="amount">Menor Precio ↑</option>
              </select>
            </div>
          </div>
        </div>

        {/* Indicador de búsqueda activa o filtro aplicado */}
        {(submittedSearch || selectedCategory !== 'todas') && (
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-lg text-xs text-blue-900">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">Filtros aplicados:</span>
              {submittedSearch && (
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800">
                  Búsqueda: <strong>&quot;{submittedSearch}&quot;</strong>
                </span>
              )}
              {selectedCategory !== 'todas' && (
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800">
                  Categoría: <strong>{selectedCategory}</strong>
                </span>
              )}
              <span className="text-blue-700">({total} artículos encontrados)</span>
            </div>
            <button
              onClick={() => {
                handleClearSearch();
                setSelectedCategory('todas');
              }}
              className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
            >
              Restablecer todo
            </button>
          </div>
        )}

        {/* Tabla de Productos (Sin columna Proveedor) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 select-none">
                <tr>
                  <th className="py-2.5 px-4">Código / SKU</th>
                  <th className="py-2.5 px-3">Descripción del Producto</th>
                  <th className="py-2.5 px-3">Categoría / Marca</th>
                  {/* Columna Stock con orden interactivo */}
                  <th
                    onClick={handleToggleStockSort}
                    title="Clic para cambiar orden por stock"
                    className="py-2.5 px-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                      <span>Existencia</span>
                      {orderBy === '-stock' && (
                        <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      {orderBy === 'stock' && (
                        <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      {orderBy !== '-stock' && orderBy !== 'stock' && (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-right">Precio Unitario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        <span>Cargando productos (skip: {page}, limit: {limit})...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No se encontraron productos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {prod.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-md">
                        <p className="font-semibold text-slate-900 leading-tight">{prod.name}</p>
                        {prod.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {prod.description}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-xs text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{prod.categoryName || 'Insumo'}</span>
                          <span className="text-[10px] text-slate-400">{prod.brandName || 'Genérico'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            prod.stock > 10
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prod.stock > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {prod.stock} {prod.unit || 'uds'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                        {formatCurrency(prod.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pie de Tabla con Controles de Paginación */}
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Mostrando <strong className="text-slate-800">{startItem}</strong> -{' '}
              <strong className="text-slate-800">{endItem}</strong> de{' '}
              <strong className="text-slate-800">{total}</strong> productos (20 por página)
            </span>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              {/* Botón Anterior */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                title="Página anterior"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              {/* Botones numéricos de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - page) > 1
                  ) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <span key={pageNum} className="px-1 text-slate-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  const isActive = pageNum === page;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={isLoading}
                      className={`w-7 h-7 text-xs font-semibold rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                title="Página siguiente"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

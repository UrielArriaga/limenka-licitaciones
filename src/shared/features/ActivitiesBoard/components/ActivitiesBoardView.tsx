import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Plus,
  Search,
  Archive,
  FolderOpen,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { BoardItem, CreateBoardDto } from '../types/activitiesBoard.types';
import { activitiesBoardService } from '../services/activitiesBoardService';
import { CreateBoardModal } from './CreateBoardModal';
import { toast } from '@/lib/alerts';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface ActivitiesBoardViewProps {
  basePath: string; // ej. "/licitaciones/tableros"
  title?: string;
  subtitle?: string;
}

export const ActivitiesBoardView: React.FC<ActivitiesBoardViewProps> = ({
  basePath,
  title = 'Panel de Actividades y Tableros',
  subtitle = 'Gestión colaborativa de actividades, pliegos, requisitos y fechas de entrega',
}) => {
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const data = await activitiesBoardService.getBoards(activeTab === 'archived');
      setBoards(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [activeTab]);

  const handleCreateBoard = async (dto: CreateBoardDto) => {
    const created = await activitiesBoardService.createBoard(dto);
    setBoards((prev) => [created, ...prev]);
    toast.success('Tablero creado correctamente', {
      description: created.name,
    });
  };

  const handleToggleArchive = async (e: React.MouseEvent, board: BoardItem) => {
    e.stopPropagation();
    const nextArchiveState = !board.isArchived;
    await activitiesBoardService.toggleArchiveBoard(board.id, nextArchiveState);
    toast.info(nextArchiveState ? 'Tablero archivado' : 'Tablero reactivado');
    fetchBoards();
  };

  const filteredBoards = boards.filter(
    (b) =>
      b.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      b.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              Limenka 360 • pm/boards
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchBoards}
            disabled={isLoading}
            title="Actualizar lista de tableros"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-xs disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-600 transition-transform ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Tablero</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros, Tabs y Búsqueda */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pestañas: Activos vs Archivados */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tableros Activos
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'archived'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archivados</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tablero por nombre o palabras clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all"
          />
        </div>
      </div>

      {/* Cuadrícula de Tableros */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          Cargando tableros de actividades...
        </div>
      ) : filteredBoards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No se encontraron tableros</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'No tienes tableros activos. Haz clic en "Nuevo Tablero" para crear uno.'
              : 'No hay tableros archivados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBoards.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Barra superior con color distintivo */}
              <div className="h-2 w-full" style={{ backgroundColor: b.color || '#2563eb' }} />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: b.color || '#2563eb' }}
                    />
                    <span className="text-[11px] text-slate-400">{b.createdAt}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {b.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {b.description || 'Sin descripción asignada.'}
                  </p>
                </div>

                {/* Métricas del Tablero */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>{b.tasksCount} actividades</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleArchive(e, b)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title={b.isArchived ? 'Reactivar tablero' : 'Archivar tablero'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    <Link
                      href={`${basePath}/${b.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Tablero */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
};


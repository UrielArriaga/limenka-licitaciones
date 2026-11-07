import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Calendar,
  User,
  Clock,
  CheckSquare,
  MessageSquare,
  Kanban,
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
  Flame,
  RefreshCw,
} from 'lucide-react';
import {
  BoardItem,
  BoardStage,
  BoardTask,
  CreateTaskDto,
} from '../types/activitiesBoard.types';
import { activitiesBoardService } from '../services/activitiesBoardService';
import { NewTaskModal } from './NewTaskModal';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { toast } from '@/lib/alerts';

interface BoardDetailViewProps {
  boardId: string;
  basePath: string; // ej. "/licitaciones/tableros"
}

export const BoardDetailView: React.FC<BoardDetailViewProps> = ({ boardId, basePath }) => {
  const [board, setBoard] = useState<BoardItem | null>(null);
  const [stages, setStages] = useState<BoardStage[]>([]);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [targetStageId, setTargetStageId] = useState<string>('stage-1');
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<BoardTask | null>(null);

  const loadBoardData = async () => {
    setIsLoading(true);
    try {
      const [b, st, tk] = await Promise.all([
        activitiesBoardService.getBoardById(boardId),
        activitiesBoardService.getStages(),
        activitiesBoardService.getTasks(boardId),
      ]);
      setBoard(b);
      setStages(st);
      setTasks(tk);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, [boardId]);

  // SLA Helper
  const getTaskSLA = (task: BoardTask) => {
    if (task.isConcluded || task.stageId === 'stage-4') {
      return { label: 'Concluida', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    }
    if (!task.due_date) {
      return { label: 'Sin límite', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
    }

    const today = new Date().toISOString().split('T')[0];
    if (task.due_date < today) {
      return { label: 'Vencida', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    }
    if (task.due_date === today) {
      return { label: 'Vence hoy (<24h)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    }
    return { label: 'En tiempo (>3 días)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  };

  // KPIs
  const openTasks = tasks.filter((t) => !t.isConcluded && t.stageId !== 'stage-4');
  const dueSoonTasks = tasks.filter((t) => {
    const today = new Date().toISOString().split('T')[0];
    return !t.isConcluded && t.due_date === today;
  });
  const overdueTasks = tasks.filter((t) => {
    const today = new Date().toISOString().split('T')[0];
    return !t.isConcluded && t.due_date && t.due_date < today;
  });
  const completedTasks = tasks.filter((t) => t.isConcluded || t.stageId === 'stage-4');

  // Filtro por responsable
  const allAssignees = Array.from(new Set(tasks.map((t) => t.assignedTo).filter(Boolean))) as string[];
  const filteredTasks = tasks.filter((t) => {
    if (selectedAssignee === 'all') return true;
    return t.assignedTo === selectedAssignee;
  });

  const handleCreateTask = async (dto: CreateTaskDto) => {
    const created = await activitiesBoardService.createTask(boardId, dto);
    setTasks((prev) => [created, ...prev]);
    toast.success('Actividad creada exitosamente', {
      description: created.title,
    });
  };

  const handleMoveTaskStage = async (taskId: string, currentStageId: string) => {
    const currentIndex = stages.findIndex((s) => s.id === currentStageId);
    const nextIndex = (currentIndex + 1) % stages.length;
    const nextStage = stages[nextIndex];
    const isConcluded = nextStage.id === 'stage-4';

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, stageId: nextStage.id, isConcluded } : t
      )
    );

    await activitiesBoardService.updateTaskStage(taskId, nextStage.id, isConcluded);
    toast.info(`Tarea movida a: ${nextStage.name}`);
  };

  const handleUpdateTaskInDrawer = (updated: BoardTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTaskForDrawer(updated);
  };

  return (
    <div className="w-full space-y-4">
      {/* Barra de Navegación y Título del Tablero */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Link
            href={basePath}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Volver a lista de tableros"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div
            className="w-3 h-8 rounded"
            style={{ backgroundColor: board?.color || '#2563eb' }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                Limenka 360 • pm/boards
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {board?.name || 'Tablero de Actividades'}
            </h1>
            {board?.description && (
              <p className="text-xs text-slate-500 line-clamp-1">{board.description}</p>
            )}
          </div>
        </div>

        {/* Controles de vista y botón de nueva tarea */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>

          <button
            onClick={loadBoardData}
            disabled={isLoading}
            title="Actualizar actividades del tablero"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-xs disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-600 transition-transform ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={() => {
              setTargetStageId(stages[0]?.id || 'stage-1');
              setIsNewTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Actividad</span>
          </button>
        </div>
      </div>

      {/* Fila de Filtros y Semáforo SLA (Idéntico a BoardSummaryHeader de crm-jobs) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Asignado por */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
              Asignada a:
            </span>
            <button
              onClick={() => setSelectedAssignee('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedAssignee === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({tasks.length})
            </button>
            {allAssignees.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedAssignee(name)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedAssignee === name
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Semáforo SLA Leyenda */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-400">SLA:</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Más de 3 días
            </span>
            <span className="flex items-center gap-1 text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              1 a 3 días
            </span>
            <span className="flex items-center gap-1 text-rose-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Vencida
            </span>
          </div>
        </div>

        {/* Fila de Tarjetas KPI compactas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-medium block">Abiertas</span>
            <p className="text-lg font-bold text-slate-900 leading-tight mt-0.5">{openTasks.length}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50/60 border border-amber-200/60">
            <span className="text-[11px] text-amber-800 font-medium block">Vencen en &lt;24 h</span>
            <p className="text-lg font-bold text-amber-900 leading-tight mt-0.5">{dueSoonTasks.length}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-50/60 border border-rose-200/60">
            <span className="text-[11px] text-rose-800 font-medium block">Vencidas</span>
            <p className="text-lg font-bold text-rose-900 leading-tight mt-0.5">{overdueTasks.length}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60">
            <span className="text-[11px] text-emerald-800 font-medium block">Concluidas</span>
            <p className="text-lg font-bold text-emerald-900 leading-tight mt-0.5">{completedTasks.length}</p>
          </div>
        </div>
      </div>

      {/* Vistas: Kanban vs Tabla */}
      {viewMode === 'kanban' ? (
        /* Vista Tablero Kanban */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const stageTasks = filteredTasks.filter((t) => t.stageId === stage.id);

            return (
              <div
                key={stage.id}
                className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 flex flex-col min-h-[500px]"
              >
                {/* Encabezado Etapa */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color || '#3b82f6' }}
                    />
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-800">
                      {stage.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {stageTasks.length}
                  </span>
                </div>

                {/* Lista de Tareas */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {stageTasks.map((t) => {
                    const sla = getTaskSLA(t);
                    const completedChecklists = t.checklists.filter((c) => c.isCompleted).length;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskForDrawer(t)}
                        className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        {/* Indicadores superiores */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sla.bg} ${sla.text} ${sla.border}`}
                          >
                            {sla.label}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              t.priority === 'urgente'
                                ? 'bg-rose-100 text-rose-800'
                                : t.priority === 'alta'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        {/* Título de la tarea */}
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                          {t.title}
                        </h4>

                        {/* Metadatos inferiores */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            {t.checklists.length > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                                {completedChecklists}/{t.checklists.length}
                              </span>
                            )}
                            {t.commentsCount > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <MessageSquare className="w-3 h-3" />
                                {t.commentsCount}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTaskStage(t.id, t.stageId);
                            }}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Mover →
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Botón Añadir tarea a esta columna */}
                  <button
                    onClick={() => {
                      setTargetStageId(stage.id);
                      setIsNewTaskModalOpen(true);
                    }}
                    className="w-full py-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl text-xs font-semibold text-slate-500 hover:text-blue-600 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Tarea</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista Tabla de Actividades */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Actividad</th>
                <th className="py-2.5 px-3">Etapa</th>
                <th className="py-2.5 px-3">Prioridad</th>
                <th className="py-2.5 px-3">Responsable</th>
                <th className="py-2.5 px-3">Fecha Límite</th>
                <th className="py-2.5 px-3 text-center">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => {
                const sla = getTaskSLA(t);
                const stage = stages.find((s) => s.id === t.stageId);

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTaskForDrawer(t)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4 font-medium text-slate-900">{t.title}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {stage?.name || 'Por Iniciar'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[11px] font-bold text-slate-600">
                      {t.priority}
                    </td>
                    <td className="py-2.5 px-3 text-xs">{t.assignedTo}</td>
                    <td className="py-2.5 px-3 text-xs">{t.due_date || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sla.bg} ${sla.text} ${sla.border}`}
                      >
                        {sla.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva Tarea */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        stages={stages}
        defaultStageId={targetStageId}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Drawer de Detalle y Checklists */}
      <TaskDetailDrawer
        task={selectedTaskForDrawer}
        onClose={() => setSelectedTaskForDrawer(null)}
        onUpdateTask={handleUpdateTaskInDrawer}
      />
    </div>
  );
};
